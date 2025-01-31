using Amazon.JSII.Runtime.Deputy;

namespace Amazon.JSII.Tests.CalculatorNamespace
{
    /// <remarks>stability: Experimental</remarks>
    [JsiiByValue]
    public class OptionalStruct : IOptionalStruct
    {
        /// <remarks>stability: Experimental</remarks>
        [JsiiProperty(name: "field", typeJson: "{\"primitive\":\"string\"}", isOptional: true, isOverride: true)]
        public string Field
        {
            get;
            set;
        }
    }
}