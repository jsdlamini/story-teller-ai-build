"use client";
import React, { useState } from "react";
import { Textarea } from "./ui/textarea";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const storiesPath = "public/stories";

import { Button } from "./ui/button";
import { Frame } from "@gptscript-ai/gptscript";
import renderEventMessage from "@/lib/renderEventMessage";

function StoryWriter() {
  const [story, setStory] = useState("");
  const [pages, setPages] = useState<number>();
  const [progress, setProgress] = useState("");
  const [runStarted, setRunStarted] = useState<boolean>(false);
  const [runFinished, setRunFinished] = useState<boolean | null>(null);
  const [currentTool, setCurrentTool] = useState("");
  const [events, setEvents] = useState<Frame[]>([]);

  async function runScript() {
    setRunStarted(true);
    setRunFinished(false);

    const response = await fetch("/api/run-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ story, pages, path: storiesPath }),
    });

    if (response.ok && response.body) {
      // Handle streams from the API
      // ...
      console.log("Streaming started");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      handleStream(reader, decoder);

      // ..
    } else {
      setRunFinished(true);
      setRunStarted(false);
      console.log("Failed to start streaming");
    }
  }

  async function handleStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    decoder: TextDecoder
  ) {
    //Manage stream from the API
    while (true) {
      const { done, value } = await reader.read();

      if (done) break; //breaks of of infinite loop

      //Explanation: The decoder is used to decode the Uint8Array into string
      const chunk = decoder.decode(value, { stream: true });

      //Explanation: We split the chunk into events by splittion it by the event: keyword \n\n
      const eventData = chunk
        .split("\n\n")
        .filter((line) => line.startsWith("event: "))
        .map((line) => line.replace(/^event: /, ""));

      //Explanation: We parse the JSON data and update the state accordingly
      eventData.forEach((data) => {
        try {
          const parsedData = JSON.parse(data);

          if (parsedData.type === "callProgress") {
            setProgress(
              parsedData.output[parsedData.output.length - 1].content
            );
            setCurrentTool(parsedData.tool?.description || "");
          } else if (parsedData.type === "callStart") {
            setCurrentTool(parsedData.tool?.description || "");
          } else if (parsedData.type === "runFinish") {
            setRunFinished(true);
            setRunStarted(false);
          } else {
            setEvents((prevEvents) => [...prevEvents, parsedData]);
          }
        } catch (error) {
          console.log("Failed to parse JSON", error);
        }
      });
    }
  }

  return (
    <div className="flex flex-col container">
      <section className="flex-1 flex flex-col border border-purple-300 rounded-md p-10 space-y-2">
        {story}
        <Textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="flex-1 text-black"
          placeholder="write a story about a robot and a human who became friends..."
        />
        Pages: {pages}
        <Select onValueChange={(value) => setPages(parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Howmany pages should the story be?" />
          </SelectTrigger>
          <SelectContent className="w-full">
            {Array.from({ length: 10 }, (_, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={!story || !pages || runStarted}
          className="w-full"
          size="lg"
          onClick={runScript}
        >
          Generate Story
        </Button>
      </section>

      <section className="flex-1 pb-5 mt-5">
        <div className="flex flex-col-reverse w-full space-y-2 bg-gray-800 rounded-md text-gray-200 font-mono p-10 h-96 overflow-y-auto">
          <div>
            {runFinished === null && (
              <>
                <p className="animate-pulse mr-5">
                  Im waiting for you to Generate a story above...
                </p>
                <br />
              </>
            )}
            <span className=" mr-5">{">>"}</span>
            {progress}
          </div>

          {currentTool && (
            <div className="py-10">
              <span className="mr-5"> {"-----[current tool] ----"} </span>
              {currentTool}
            </div>
          )}

          {/* Render events as they come in */}

          <div className="space-y-5">
            {events.map((event, index) => (
              <div key={index}>
                <span className="mr-5">{">>"}</span>
                {renderEventMessage(event)}
              </div>
            ))}
          </div>
          {runStarted && (
            <div>
              <span className="mr-5 animate-in">
                {"--- [AI Story teller Has Started] ---"}
              </span>
              <br />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default StoryWriter;
