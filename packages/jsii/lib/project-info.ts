import fs = require('fs-extra');
import spec = require('jsii-spec');
import log4js = require('log4js');
import path = require('path');
import semver = require('semver');

// tslint:disable:no-var-requires Modules without TypeScript definitions
const spdx: Set<string> = require('spdx-license-list/simple');
// tslint:enable:no-var-requires

const LOG = log4js.getLogger('jsii/package-info');

export interface TSCompilerOptions {
    readonly outDir?: string;
    readonly rootDir?: string;
}

export interface ProjectInfo {
    readonly projectRoot: string;
    readonly packageJson: any;

    readonly name: string;
    readonly version: string;
    readonly author: spec.Person;
    readonly deprecated?: string;
    readonly stability?: spec.Stability;
    readonly license: string;
    readonly repository: {
        readonly type: string;
        readonly url: string;
        readonly directory?: string;
    };

    readonly main: string;
    readonly types: string;

    readonly dependencies: ReadonlyArray<spec.Assembly>;
    readonly peerDependencies: ReadonlyArray<spec.Assembly>;
    readonly transitiveDependencies: ReadonlyArray<spec.Assembly>;
    readonly bundleDependencies?: { readonly [name: string]: string };
    readonly targets: spec.AssemblyTargets;
    readonly metadata?: { [key: string]: any };
    readonly jsiiVersionFormat: 'short' | 'full';
    readonly description?: string;
    readonly homepage?: string;
    readonly contributors?: ReadonlyArray<spec.Person>;
    readonly excludeTypescript: string[];
    readonly projectReferences?: boolean;
    readonly tsc?: TSCompilerOptions;
}

export async function loadProjectInfo(projectRoot: string, { fixPeerDependencies }: { fixPeerDependencies: boolean }): Promise<ProjectInfo> {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const pkg = require(packageJsonPath);

    let bundleDependencies: { [name: string]: string } | undefined;
    for (const name of (pkg.bundleDependencies || pkg.bundledDependencies || [])) {
        const version = pkg.dependencies && pkg.dependencies[name];
        if (!version) {
            throw new Error(`The "package.json" file has "${name}" in "bundleDependencies", but it is not declared in "dependencies"`);
        }

        if (pkg.peerDependencies && name in pkg.peerDependencies) {
            throw new Error(`The "package.json" file has "${name}" in "bundleDependencies", and also in "peerDependencies"`);
        }

        bundleDependencies = bundleDependencies || {};
        bundleDependencies[name] = version;
    }

    let addedPeerDependency = false;
    Object.entries(pkg.dependencies || {}).forEach(([name, version]) => {
        if (name in (bundleDependencies || {})) {
            return;
        }
        pkg.peerDependencies = pkg.peerDependencies || {};
        const peerVersion = pkg.peerDependencies[name];
        if (peerVersion === version) {
            return;
        }
        if (!fixPeerDependencies) {
            if (peerVersion) {
                // tslint:disable-next-line: max-line-length
                throw new Error(`The "package.json" file has different version requirements for "${name}" in "dependencies" (${version}) versus "peerDependencies" (${peerVersion})`);
            }
            throw new Error(`The "package.json" file has "${name}" in "dependencies", but not in "peerDependencies"`);
        }
        if (peerVersion) {
            LOG.warn(`Changing "peerDependency" on "${name}" from "${peerVersion}" to ${version}`);
        } else {
            LOG.warn(`Recording missing "peerDependency" on "${name}" at ${version}`);
        }
        pkg.peerDependencies[name] = version;
        addedPeerDependency = true;
    });
    // Re-write "package.json" if we fixed up "peerDependencies" and were told to automatically fix.
    // Yes, we should never have addedPeerDependencies if not fixPeerDependency, but I still check again.
    if (addedPeerDependency && fixPeerDependencies) {
        await fs.writeJson(packageJsonPath, pkg, { encoding: 'utf8', spaces: 2 });
    }

    const transitiveAssemblies: { [name: string]: spec.Assembly } = {};
    const dependencies =
        await _loadDependencies(pkg.dependencies, projectRoot, transitiveAssemblies, new Set<string>(Object.keys(bundleDependencies || {})));
    const peerDependencies =
        await _loadDependencies(pkg.peerDependencies, projectRoot, transitiveAssemblies);

    const transitiveDependencies = Object.keys(transitiveAssemblies).map(name => transitiveAssemblies[name]);

    return {
        projectRoot,
        packageJson: pkg,

        name: _required(pkg.name, 'The "package.json" file must specify the "name" attribute'),
        version: _required(pkg.version, 'The "package.json" file must specify the "version" attribute'),
        deprecated: pkg.deprecated,
        stability: _validateStability(pkg.stability, pkg.deprecated),
        author: _toPerson(_required(pkg.author, 'The "package.json" file must specify the "author" attribute'), 'author'),
        repository: {
            url: _required(pkg.repository.url, 'The "package.json" file must specify the "repository.url" attribute'),
            type: pkg.repository.type || _guessRepositoryType(pkg.repository.url),
            directory: pkg.repository.directory,
        },
        license: _validateLicense(pkg.license),

        main: _required(pkg.main, 'The "package.json" file must specify the "main" attribute'),
        types: _required(pkg.types, 'The "package.json" file must specify the "types" attribute'),

        dependencies,
        peerDependencies,
        transitiveDependencies,
        bundleDependencies,
        targets: {
            ..._required(pkg.jsii, 'The "package.json" file must specify the "jsii" attribute').targets,
            js: { npm: pkg.name }
        },
        metadata: pkg.jsii && pkg.jsii.metadata,
        jsiiVersionFormat: _validateVersionFormat(pkg.jsii.versionFormat || 'full'),

        description: pkg.description,
        homepage: pkg.homepage,
        contributors: pkg.contributors
            && (pkg.contributors as any[]).map((contrib, index) => _toPerson(contrib, `contributors[${index}]`, 'contributor')),

        excludeTypescript: (pkg.jsii && pkg.jsii.excludeTypescript) || [],
        projectReferences: pkg.jsii && pkg.jsii.projectReferences,
        tsc: {
            outDir: pkg.jsii && pkg.jsii.tsc && pkg.jsii.tsc.outDir,
            rootDir: pkg.jsii && pkg.jsii.tsc && pkg.jsii.tsc.rootDir,
        }
    };
}

function _guessRepositoryType(url: string): string {
    if (url.endsWith('.git')) { return 'git'; }
    const parts = url.match(/^([^:]+):\/\//);
    if (parts && parts[1] !== 'http' && parts[1] !== 'https') {
        return parts[1];
    }
    throw new Error(`The "package.json" file must specify the "repository.type" attribute (could not guess from ${url})`);
}

async function _loadDependencies(dependencies: { [name: string]: string | spec.PackageVersion } | undefined,
                                 searchPath: string,
                                 transitiveAssemblies: { [name: string]: spec.Assembly },
                                 bundled = new Set<string>()): Promise<spec.Assembly[]> {
    if (!dependencies) { return []; }
    const assemblies = new Array<spec.Assembly>();
    for (const name of Object.keys(dependencies)) {
        if (bundled.has(name)) { continue; }
        const dep = dependencies[name];
        const versionString = typeof dep === 'string' ? dep : dep.version;
        const version = new semver.Range(versionString);
        if (!version) {
            throw new Error(`Invalid semver expression for ${name}: ${versionString}`);
        }
        const pkg = _tryResolve(path.join(name, '.jsii'), searchPath);
        LOG.debug(`Resolved dependency ${name} to ${pkg}`);
        const assm = await loadAndValidateAssembly(pkg);
        if (!version.intersects(new semver.Range(assm.version))) {
            throw new Error(`Declared dependency on version ${versionString} of ${name}, but version ${assm.version} was found`);
        }
        assemblies.push(assm);
        transitiveAssemblies[assm.name] = assm;
        const pkgDir = path.dirname(pkg);
        if (assm.dependencies) {
            await _loadDependencies(assm.dependencies, pkgDir, transitiveAssemblies);
        }
    }
    return assemblies;
}

const ASSEMBLY_CACHE = new Map<string, spec.Assembly>();

/**
 * Load a JSII filename and validate it; cached to avoid redundant loads of the same JSII assembly
 */
async function loadAndValidateAssembly(jsiiFileName: string): Promise<spec.Assembly> {
    if (!ASSEMBLY_CACHE.has(jsiiFileName)) {
        ASSEMBLY_CACHE.set(jsiiFileName, spec.validateAssembly(await fs.readJson(jsiiFileName)));
    }
    return ASSEMBLY_CACHE.get(jsiiFileName)!;
}

function _required<T>(value: T, message: string): T {
    if (value == null) {
        throw new Error(message);
    }
    return value;
}

function _toPerson(value: any, field: string, defaultRole: string = field): spec.Person {
    return {
        name: _required(value.name, `The "package.json" file must specify the "${field}.name" attribute`),
        roles: value.roles ? [...new Set(value.roles as string[])] : [defaultRole],
        email: value.email,
        url: value.url,
        organization: value.organization ? value.organization : undefined
    };
}

function _tryResolve(mod: string, searchPath: string): string {
    try {
        const paths = [ searchPath, path.join(searchPath, 'node_modules') ];
        return require.resolve(mod, { paths });
    } catch (e) {
        throw new Error(`Unable to locate module: ${mod}`);
    }
}

function _validateLicense(id: string): string {
    if (id === 'UNLICENSED') { return id; }
    if (!spdx.has(id)) {
        throw new Error(`Invalid license identifier "${id}", see valid license identifiers at https://spdx.org/licenses/`);
    }
    return id;
}

function _validateVersionFormat(format: string): 'short' | 'full' {
    if (format !== 'short' && format !== 'full') {
        throw new Error(`Invalid jsii.versionFormat "${format}", it must be either "short" or "full" (the default)`);
    }
    return format;
}

function _validateStability(stability: string | undefined, deprecated: string | undefined): spec.Stability | undefined {
    if (!stability && deprecated) {
        stability = spec.Stability.Deprecated;
    } else if (deprecated && stability !== spec.Stability.Deprecated) {
        throw new Error(`Package is deprecated (${deprecated}), but it's stability is ${stability} and not ${spec.Stability.Deprecated}`);
    }
    if (!stability) {
        return undefined;
    }
    if (Object.values(spec.Stability).indexOf(stability) === -1) {
        throw new Error(`Invalid stability "${stability}", it must be one of ${Object.values(spec.Stability).join(', ')}`);
    }
    return stability as spec.Stability;
}
