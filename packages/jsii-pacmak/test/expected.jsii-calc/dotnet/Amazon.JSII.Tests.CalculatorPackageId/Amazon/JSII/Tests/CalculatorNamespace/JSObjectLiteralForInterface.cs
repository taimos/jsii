using Amazon.JSII.Runtime.Deputy;
using Amazon.JSII.Tests.CalculatorNamespace.LibNamespace;

namespace Amazon.JSII.Tests.CalculatorNamespace
{
    /// <remarks>stability: Experimental</remarks>
    [JsiiClass(nativeType: typeof(JSObjectLiteralForInterface), fullyQualifiedName: "jsii-calc.JSObjectLiteralForInterface")]
    public class JSObjectLiteralForInterface : DeputyBase
    {
        public JSObjectLiteralForInterface(): base(new DeputyProps(new object[]{}))
        {
        }

        protected JSObjectLiteralForInterface(ByRefValue reference): base(reference)
        {
        }

        protected JSObjectLiteralForInterface(DeputyProps props): base(props)
        {
        }

        /// <remarks>stability: Experimental</remarks>
        [JsiiMethod(name: "giveMeFriendly", returnsJson: "{\"type\":{\"fqn\":\"@scope/jsii-calc-lib.IFriendly\"}}")]
        public virtual IIFriendly GiveMeFriendly()
        {
            return InvokeInstanceMethod<IIFriendly>(new object[]{});
        }

        /// <remarks>stability: Experimental</remarks>
        [JsiiMethod(name: "giveMeFriendlyGenerator", returnsJson: "{\"type\":{\"fqn\":\"jsii-calc.IFriendlyRandomGenerator\"}}")]
        public virtual IIFriendlyRandomGenerator GiveMeFriendlyGenerator()
        {
            return InvokeInstanceMethod<IIFriendlyRandomGenerator>(new object[]{});
        }
    }
}