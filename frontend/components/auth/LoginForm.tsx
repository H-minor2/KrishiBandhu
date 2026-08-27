"use client";

import React, { useState } from "react";
import Link from "next/link";
import { loginFarmer, isSupabaseConfigured } from "../../lib/supabase/client";
import { getTranslation } from "../../lib/constants/languages";
import { useLanguage } from "../../lib/context/LanguageContext";
import LanguageSelector from "./LanguageSelector";

export default function LoginForm() {
  const { lang, setLang, t } = useLanguage();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!mobile || mobile.trim().length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    const result = await loginFarmer(mobile, password);
    setLoading(false);

    if (result.success) {
      window.location.href = "/dashboard";
    } else {
      setErrorMsg(
        result.error || "Sign in failed. Please check your credentials.",
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-white border-2 border-black p-6 rounded-none shadow-none">
        <h2 className="text-2xl font-bold mb-2 text-[#003366] border-b border-black pb-2">
          {t("loginTitle")}
        </h2>

        {!isSupabaseConfigured && (
          <div className="mb-4 bg-amber-50 border border-amber-500 p-2 text-xs text-amber-900 font-semibold">
            ⚡ Demo / Local Mode: Database operating in client mode. Credentials
            will validate directly.
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 bg-red-100 border border-red-600 text-red-800 p-3 text-sm font-bold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-mobile"
              className="font-bold text-black text-sm"
            >
              {t("mobileNumber")} *
            </label>
            <input
              id="login-mobile"
              type="tel"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="font-bold text-black text-sm"
            >
              {t("password")} (Optional if using OTP)
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-black p-3 rounded-none text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#058b2d] text-white font-bold border border-black p-3.5 cursor-pointer hover:bg-blue-800 rounded-none outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : t("signInButton")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm border-t border-gray-200 pt-4">
          <span>{t("dontHaveAccount")} </span>
          <Link
            href="/signup"
            className="text-[#003366] font-bold underline hover:text-blue-800"
          >
            {t("signupTitle")}
          </Link>
        </div>
      </div>
    </div>
  );
}
