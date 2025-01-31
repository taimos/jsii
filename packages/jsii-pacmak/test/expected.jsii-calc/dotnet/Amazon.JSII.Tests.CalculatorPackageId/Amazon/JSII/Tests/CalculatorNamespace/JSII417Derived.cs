using Amazon.JSII.Runtime.Deputy;

namespace Amazon.JSII.Tests.CalculatorNamespace
{
    /// <remarks>stability: Experimental</remarks>
    [JsiiClass(nativeType: typeof(JSII417Derived), fullyQualifiedName: "jsii-calc.JSII417Derived", parametersJson: "[{\"name\":\"property\",\"type\":{\"primitive\":\"string\"}}]")]
    public class JSII417Derived : JSII417PublicBaseOfBase
    {
        /// <remarks>stability: Experimental</remarks>
        public JSII417Derived(string property): base(new DeputyProps(new object[]{property}))
        {
        }

        protected JSII417Derived(ByRefValue reference): base(reference)
        {
        }

        protected JSII417Derived(DeputyProps props): base(props)
        {
        }

        /// <remarks>stability: Experimental</remarks>
        [JsiiProperty(name: "property", typeJson: "{\"primitive\":\"string\"}")]
        protected virtual string Property
        {
            get => GetInstanceProperty<string>();
        }

        /// <remarks>stability: Experimental</remarks>
        [JsiiMethod(name: "bar")]
        public virtual void Bar()
        {
            InvokeInstanceVoidMethod(new object[]{});
        }

        /// <remarks>stability: Experimental</remarks>
        [JsiiMethod(name: "baz")]
        public virtual void Baz()
        {
            InvokeInstanceVoidMethod(new object[]{});
        }
    }
}