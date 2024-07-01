import { Frame } from "@gptscript-ai/gptscript";

const renderEventMessage = (event: Frame) => {
  console.log("here...");
  console.log(event);
  switch (event.type) {
    case "runStart":
      return (
        <div>
          <p>Tool Starting: {event.tool?.description}</p>
        </div>
      );
    case "callChat":
      return (
        <div>
          Chat in progress with input {">>"} {String(event.input)}
        </div>
      );
    case "callProgress":
      return null;
    case "callFinish":
      return (
        <div>
          Call finished:{" "}
          {event.output?.map((output) => (
            <div key={output.content}>{output.content}</div>
          ))}
        </div>
      );
    case "runFinish":
      return <div>Run finished at {event.end}</div>;

    case "callSubCalls":
      return (
        <div>
          Sub-calls in progress:
          {event.output?.map((output, index) => (
            <div key={index}>
              <div>{output.content}</div>
              {output.subCalls &&
                Object.keys(output.subCalls).map((subCallKey) => (
                  <div key={subCallKey}>
                    <strong>Subcall {subCallKey}:</strong>
                    <div>Tool ID: {output.subCalls[subCallKey].toolID}</div>
                    <div>Input: {output.subCalls[subCallKey].input}</div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      );
    case "callContinue":
      return (
        <div>
          Call continue:
          {event.output?.map((output, index) => (
            <div key={index}>
              <div>{output.content}</div>
              {output.subCalls &&
                Object.keys(output.subCalls).map((subCallKey) => (
                  <div key={subCallKey}>
                    <strong>Subcall {subCallKey}:</strong>
                    <div>Tool ID: {output.subCalls[subCallKey].toolID}</div>
                    <div>Input: {output.subCalls[subCallKey].input}</div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      );
    case "callConfirm":
      return (
        <div>
          Call confirm:
          {event.output?.map((output, index) => (
            <div key={index}>
              <div>{output.content}</div>
              {output.subCalls &&
                Object.keys(output.subCalls).map((subCallKey) => (
                  <div key={subCallKey}>
                    <strong>Subcall {subCallKey}:</strong>
                    <div>Tool ID: {output.subCalls[subCallKey].toolID}</div>
                    <div>Input: {output.subCalls[subCallKey].input}</div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      );
    default:
      return <pre>{JSON.stringify(event, null, 2)}</pre>;
  }
};

export default renderEventMessage;
