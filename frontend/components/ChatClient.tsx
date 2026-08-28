"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Bot, User, Send, ArrowLeft, Wheat, Mountain, CloudRain } from "lucide-react";
import LanguageSelector from "./auth/LanguageSelector";
import { useLanguage } from "../lib/context/LanguageContext";
import "../app/globals.css";

type ChatStep =
  | "initializing"
  | "growth_stage"
  | "pesticide_applied"
  | "fetching"
  | "done";

interface ChatAnswers {
  crop: string;
  growth_stage: string;
  soil_type: string;
  pesticide_applied: boolean | null;
  avg_rainfall_7day: number | null;
}

export default function ChatBotPage() {
  const { lang, setLang, t } = useLanguage();
  const params = useParams();
  const cropId = params.cropId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      sender: "ai",
      text: "advIntro",
    },
  ]);

  const [chatStep, setChatStep] = useState<ChatStep>("initializing");
  const [answers, setAnswers] = useState<ChatAnswers>({
    crop: "",
    growth_stage: "",
    soil_type: "",
    pesticide_applied: null,
    avg_rainfall_7day: null,
  });
  const [numberInput, setNumberInput] = useState("");

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatStep]);

  useEffect(() => {
    // Auto-hydrate from localStorage if cropId exists
    if (cropId && cropId !== "new") {
      try {
        const storedCrops = localStorage.getItem("krishi_bandhu_cached_crops") || localStorage.getItem("krishibandhu_farmer_crops") || localStorage.getItem("krishibandhu_crops");
        if (storedCrops) {
          const crops = JSON.parse(storedCrops);
          const decodedCropId = decodeURIComponent(cropId);
          let crop = crops.find((c: any) => c.id === decodedCropId || c.crop_name === decodedCropId || c.crop_name?.toLowerCase() === decodedCropId.toLowerCase());
          if (!crop) {
            const cropIndex = parseInt(decodedCropId);
            if (!isNaN(cropIndex) && cropIndex >= 0 && cropIndex < crops.length) {
              crop = crops[cropIndex];
            }
          }
          if (crop) {
            setAnswers(prev => ({
              ...prev,
              crop: crop.crop_name,
              soil_type: crop.soil_type || "Alluvial"
            }));
            setChatStep("growth_stage");
            return;
          }
        }
      } catch (e) {
        console.error("Failed to parse crops from localStorage", e);
      }
    }
    // If not hydrated, still start at growth stage as per new requirements
    setChatStep("growth_stage");
  }, [cropId]);

  // Handle asking the next question based on chatStep
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (messages[messages.length - 1].sender === "user") {
      const askQuestion = (q: string) => {
        timeoutId = setTimeout(
          () =>
            setMessages((prev) => [
              ...prev,
              { id: Date.now(), sender: "ai", text: q },
            ]),
          400,
        );
      };

      switch (chatStep) {
        case "growth_stage":
          askQuestion("advAskStage");
          break;
        case "pesticide_applied":
          askQuestion("advAskPesticide");
          break;
        case "fetching":
          askQuestion("advFetching");
          fetchAdvisory();
          break;
      }
    } else if (messages.length === 1 && chatStep !== "initializing") {
      // Ask first question on load
      const firstQ = "advAskStage";
      timeoutId = setTimeout(
        () =>
          setMessages((prev) => {
            // Prevent duplicate initial questions if it's already there
            if (prev.some(m => m.text === firstQ)) return prev;
            return [
              ...prev,
              { id: Date.now(), sender: "ai", text: firstQ },
            ];
          }),
        400,
      );
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatStep]);

  const handleOptionSelect = (
    value: string | boolean,
    displayValue: string,
  ) => {
    // Record user answer
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: displayValue },
    ]);

    setAnswers((prev) => ({ ...prev, [chatStep]: value }));

    // Move to next step
    switch (chatStep) {
      case "growth_stage":
        setChatStep("pesticide_applied");
        break;
      case "pesticide_applied":
        setChatStep("fetching");
        break;
      default:
        break;
    }
  };

  const handleNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numberInput.trim() || isNaN(Number(numberInput))) return;

    const val = Number(numberInput);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: `${val} mm` },
    ]);
    setAnswers((prev) => ({ ...prev, avg_rainfall_7day: val }));
    setNumberInput("");
    setChatStep("fetching");
  };

  const fetchAdvisory = async () => {
    try {
      // Auto-fetch rainfall if we have a location in the profile
      let autoRainfall = 0;
      try {
        const profileStr = localStorage.getItem("krishibandhu_profile");
        if (profileStr) {
          const profile = JSON.parse(profileStr);
          if (profile.latitude && profile.longitude) {
            const meteoRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${profile.latitude}&longitude=${profile.longitude}&daily=precipitation_sum&past_days=7&forecast_days=1&timezone=auto`
            );
            if (meteoRes.ok) {
              const meteoData = await meteoRes.json();
              const rainList = meteoData.daily?.precipitation_sum || [];
              // Sum up the past 7 days (omitting today if forecast_days=1 is the last item, or just sum all)
              autoRainfall = rainList.reduce((a: number, b: number) => a + (b || 0), 0);
            }
          }
        }
      } catch (err) {
        console.error("Failed to auto-fetch rainfall", err);
      }

      const payload = { ...answers };
      if (!payload.avg_rainfall_7day) {
        payload.avg_rainfall_7day = autoRainfall;
      }

      const response = await fetch("/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "ai",
            text: `Water Deficit: ${data.water_deficit_mm.toFixed(2)} mm\n\nAdvisory: ${data.advisory}`,
          },
        ]);
        setChatStep("done");
      }, 1000);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "ai",
            text: "advError",
          },
        ]);
        setChatStep("done");
      }, 1000);
    }
  };

  return (
    <main className="min-h-screen m-0 p-0 font-[Arial,Verdana,sans-serif] bg-slate-50 text-black flex flex-col h-screen">
      {/* Navbar */}
      <nav className="w-full bg-[#058b2d] text-white p-4 border-b border-black flex flex-wrap gap-4 justify-between items-center rounded-none shadow-none shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="w-12 h-12 bg-white flex items-center justify-center text-[#003366] border border-black font-bold no-underline"
          >
            SEAL
          </Link>
          <div>
            <h1 className="m-0 text-xl font-bold tracking-tight">
              {t("appTitle")}
            </h1>
            <p className="m-0 text-xs text-gray-300 font-bold uppercase tracking-widest mt-1">
              {t("govOfIndia")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageSelector
            showCardLayout={false}
          />
          <Link
            href="/dashboard"
            className="bg-white text-[#003366] border border-black px-4 py-2 font-bold flex items-center gap-2 cursor-pointer outline-none hover:bg-gray-200 no-underline text-sm rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToDashboard")}
          </Link>
        </div>
      </nav>

      {/* Main Chat Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col p-4 sm:p-6 overflow-hidden">
        {/* Chat Header & Context Info Banner */}
        <div className="bg-white border-2 border-black p-4 mb-4 rounded-xl flex flex-col gap-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-[#058b2d] p-2 rounded-full">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">{t("aiAssistant")}</h2>
              <p className="text-sm text-gray-600 font-medium">
                {t("consultingFor")} #{cropId.substring(0, 8)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 text-sm font-bold text-[#003366]">
            {answers.crop && (
              <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-[#058b2d]">
                <Wheat className="w-4 h-4 text-[#058b2d]" />
                {t(`crop_${answers.crop.toLowerCase()}`) || answers.crop}
              </div>
            )}
            {answers.soil_type && (
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-500">
                <Mountain className="w-4 h-4 text-amber-700" />
                {t(`soil_${answers.soil_type.toLowerCase()}`) || answers.soil_type}
              </div>
            )}
            {answers.avg_rainfall_7day !== null && answers.avg_rainfall_7day !== undefined && (
              <div className="flex items-center gap-1.5 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-500">
                <CloudRain className="w-4 h-4 text-sky-700" />
                {answers.avg_rainfall_7day.toFixed(1)} mm
              </div>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-white border-2 border-black rounded-xl p-4 overflow-y-auto flex flex-col gap-4 mb-4">
          {chatStep === "initializing" && (
            <div className="text-center font-bold text-gray-500 my-4">Initializing context...</div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 max-w-[85%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"}`}
            >
              <div
                className={`shrink-0 p-2 rounded-full border-2 border-black ${msg.sender === "user" ? "bg-amber-100" : "bg-[#058b2d]"}`}
              >
                {msg.sender === "user" ? (
                  <User className="w-5 h-5 text-black" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`p-3 border-2 border-black text-sm font-semibold whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-amber-50 rounded-2xl rounded-br-sm text-black"
                    : "bg-slate-100 rounded-2xl rounded-bl-sm text-[#003366]"
                }`}
              >
                {t(msg.text)}
              </div>
            </div>
          ))}

          {/* Quick Replies / Option Pills */}
          {messages[messages.length - 1].sender === "ai" &&
            chatStep !== "fetching" &&
            chatStep !== "done" && (
              <div className="flex flex-wrap gap-2 mt-2 ml-12">
                {chatStep === "growth_stage" &&
                  [
                    "sowing",
                    "vegetative",
                    "flowering",
                    "fruiting",
                    "maturity",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        handleOptionSelect(
                          s,
                          `stage_${s}`
                        )
                      }
                      className="bg-white border-2 border-[#003366] text-[#003366] font-bold px-4 py-2 rounded-full text-sm hover:bg-[#058b2d] hover:text-white transition-colors capitalize"
                    >
                      {t(`stage_${s}`)}
                    </button>
                  ))}

                {chatStep === "pesticide_applied" && (
                  <>
                    <button
                      onClick={() => handleOptionSelect(true, "advYes")}
                      className="bg-white border-2 border-emerald-600 text-emerald-700 font-bold px-5 py-2 rounded-full text-sm hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      {t("advYes")}
                    </button>
                    <button
                      onClick={() => handleOptionSelect(false, "advNo")}
                      className="bg-white border-2 border-red-600 text-red-700 font-bold px-5 py-2 rounded-full text-sm hover:bg-red-600 hover:text-white transition-colors"
                    >
                      {t("advNo")}
                    </button>
                  </>
                )}
              </div>
            )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Only show for Rainfall step) */}
        {/* <div className="shrink-0 h-20">
          {chatStep === "avg_rainfall_7day" ? (
            <form
              onSubmit={handleNumberSubmit}
              className="bg-white border-2 border-black rounded-xl p-3 flex gap-3 shadow-sm"
            >
              <input
                type="number"
                step="0.1"
                min="0"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                placeholder="0.0"
                className="flex-1 bg-slate-50 border border-black rounded-lg px-4 py-3 text-black font-bold outline-none focus:ring-2 focus:ring-[#003366]"
                autoFocus
              />
              <button
                type="submit"
                disabled={!numberInput.trim()}
                className="bg-[#058b2d] text-white px-6 py-3 font-bold border border-black rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {t("send")} <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="bg-slate-200 border-2 border-gray-300 rounded-xl p-4 text-center text-sm font-bold text-gray-500">
              {chatStep === "done" ? t("advDone") : t("advSelectOption")}
            </div>
          )}
        </div> */}
      </div>
    </main>
  );
}
