"use client";

import { useState } from "react";
import { AleForm } from "@/components/aleForm";
import dynamic from "next/dynamic";
import { Oswald } from "next/font/google";

const oswald = Oswald({
  subsets: ["latin"],
  weight: "700",
});

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function Page() {
  const [crawl, setCrawl] = useState(null);
  const [warning, setWarning] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  function handleCrawlGenerated(breweries, warningMsg, city) {
    setCrawl(breweries);
    setWarning(warningMsg);
    setSelectedCity(city);
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className={`${oswald.className} text-5xl w-fit mx-auto`}>Aleblazer</h1>
      <h2 className="w-fit mx-auto">Craft Your Brewery Crawl</h2>
      <div className="gap-6 w-1/2 mx-auto">
        <div>
          <AleForm onCrawlGenerated={handleCrawlGenerated} />
        </div>

        <div>
          {crawl && (
            <>
              {warning && (
                <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded">
                  {warning}
                </div>
              )}

              <h2 className="text-xl font-bold mb-4">Your Brewery Crawl</h2>
              <div className="space-y-2 mb-4">
                {crawl.map((brewery, index) => (
                  <div key={brewery.id} className="p-3 border rounded">
                    <div className="font-semibold">
                      {index + 1}. {brewery.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {brewery.street}, {brewery.city}
                    </div>
                    {brewery.distanceFromPrevious && (
                      <div className="text-sm text-blue-600">
                        {brewery.distanceFromPrevious} miles from previous stop
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Map breweries={crawl} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
