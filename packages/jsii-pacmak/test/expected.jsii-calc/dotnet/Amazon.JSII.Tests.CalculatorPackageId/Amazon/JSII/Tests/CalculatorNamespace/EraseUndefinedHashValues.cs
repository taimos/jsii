using Amazon.JSII.Runtime.Deputy;

namespace Amazon.JSII.Tests.CalculatorNamespace
{
    /// <remarks>stability: Experimental</remarks>
    [JsiiClass(nativeType: typeof(EraseUndefinedHashValues), fullyQualifiedName: "jsii-calc.EraseUndefinedHashValues")]
    public class EraseUndefinedHashValues : DeputyBase
    {
        public EraseUndefinedHashValues(): base(new DeputyProps(new object[]{}))
        {
        }

        protected EraseUndefinedHashValues(ByRefValue reference): base(reference)
        {
        }

        protected EraseUndefinedHashValues(DeputyProps props): base(props)
        {
        }

        /// <summary>Returns `true` if `key` is defined in `opts`.</summary>
        /// <remarks>
        /// Used to check that undefined/null hash values
        /// are being erased when sending values from native code to JS.
        /// stability: Experimental
        /// </remarks>
        [JsiiMethod(name: "doesKeyExist", returnsJson: "{\"type\":{\"primitive\":\"boolean\"}}", parametersJson: "[{\"name\":\"opts\",\"type\":{\"fqn\":\"jsii-calc.EraseUndefinedHashValuesOptions\"}},{\"name\":\"key\",\"type\":{\"primitive\":\"string\"}}]")]
        public static bool DoesKeyExist(IEraseUndefinedHashValuesOptions opts, string key)
        {
            return InvokeStaticMethod<bool>(typeof(EraseUndefinedHashValues), new object[]{opts, key});
        }

        /// <summary>We expect "prop1" to be erased.</summary>
        /// <remarks>stability: Experimental</remarks>
        [JsiiMethod(name: "prop1IsNull", returnsJson: "{\"type\":{\"primitive\":\"any\"}}")]
        public static object Prop1IsNull()
        {
            return InvokeStaticMethod<object>(typeof(EraseUndefinedHashValues), new object[]{});
        }

        /// <summary>We expect "prop2" to be erased.</summary>
        /// <remarks>stability: Experimental</remarks>
        [JsiiMethod(name: "prop2IsUndefined", returnsJson: "{\"type\":{\"primitive\":\"any\"}}")]
        public static object Prop2IsUndefined()
        {
            return InvokeStaticMethod<object>(typeof(EraseUndefinedHashValues), new object[]{});
        }
    }
}