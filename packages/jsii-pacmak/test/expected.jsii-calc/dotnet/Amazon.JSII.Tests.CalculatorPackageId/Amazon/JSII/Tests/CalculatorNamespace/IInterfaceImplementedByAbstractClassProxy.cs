using Amazon.JSII.Runtime.Deputy;

namespace Amazon.JSII.Tests.CalculatorNamespace
{
    /// <summary>awslabs/jsii#220 Abstract return type.</summary>
    /// <remarks>stability: Experimental</remarks>
    [JsiiTypeProxy(nativeType: typeof(IIInterfaceImplementedByAbstractClass), fullyQualifiedName: "jsii-calc.IInterfaceImplementedByAbstractClass")]
    internal sealed class IInterfaceImplementedByAbstractClassProxy : DeputyBase, IIInterfaceImplementedByAbstractClass
    {
        private IInterfaceImplementedByAbstractClassProxy(ByRefValue reference): base(reference)
        {
        }

        /// <remarks>stability: Experimental</remarks>
        [JsiiProperty(name: "propFromInterface", typeJson: "{\"primitive\":\"string\"}")]
        public string PropFromInterface
        {
            get => GetInstanceProperty<string>();
        }
    }
}