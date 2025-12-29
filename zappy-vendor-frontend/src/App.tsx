import { useState } from "react";
import API from "./api";

function App() {
  const [step, setStep] = useState<
    "CHECKIN" | "OTP" | "PRESETUP" | "POSTSETUP" | "DONE"
  >("CHECKIN");

  const [vendorId, setVendorId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [checkinPhoto, setCheckinPhoto] = useState<File | null>(null);

  const [eventId, setEventId] = useState("");
  const [otp, setOtp] = useState("");

  const [prePhoto, setPrePhoto] = useState<File | null>(null);
  const [preNotes, setPreNotes] = useState("");

  const [postPhoto, setPostPhoto] = useState<File | null>(null);
  const [postNotes, setPostNotes] = useState("");


  const handleCheckIn = async () => {
    try {
      if (!checkinPhoto) return alert("Photo required");

      const fd = new FormData();
      fd.append("vendorId", vendorId);
      fd.append("latitude", latitude);
      fd.append("longitude", longitude);
      fd.append("photo", checkinPhoto);

      const res = await API.post("/events/check-in", fd);
      setEventId(res.data._id);
      setStep("OTP");
    } catch {
      alert("Check-in failed");
    }
  };

  const handleSendOtp = async () => {
    try {
      await API.post(`/events/${eventId}/send-otp`);
    } catch {
      alert("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await API.post(`/events/${eventId}/verify-otp`, { otp });
      setStep("PRESETUP");
    } catch {
      alert("Invalid OTP");
    }
  };

  const handlePreSetup = async () => {
    try {
      if (!prePhoto) return alert("Photo required");

      const fd = new FormData();
      fd.append("photo", prePhoto);
      fd.append("notes", preNotes);
      fd.append("vendorId", vendorId);

      await API.post(`/events/${eventId}/pre-setup`, fd, {
        headers: { "x-vendor-id": vendorId },
      });

      setStep("POSTSETUP");
    } catch {
      alert("Pre-setup failed");
    }
  };

  const handlePostSetup = async () => {
    try {
      if (!postPhoto) return alert("Photo required");

      const fd = new FormData();
      fd.append("photo", postPhoto);
      fd.append("notes", postNotes);
      fd.append("vendorId", vendorId);

      await API.post(`/events/${eventId}/post-setup`, fd, {
        headers: { "x-vendor-id": vendorId },
      });

      setStep("DONE");
    } catch {
      alert("Post-setup failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl shadow-md overflow-hidden">

        <div className="hidden md:flex flex-col justify-between px-12 py-14 bg-slate-50 border-r">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">
              Vendor Event Operations
            </h1>
            <p className="mt-4 text-sm text-slate-600 max-w-sm">
              Secure internal panel to check in vendors, verify OTP authorization,
              and document setup completion.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-slate-700">
              <li>• Location & identity verification</li>
              <li>• OTP-based authorization</li>
              <li>• Pre & post setup audit</li>
            </ul>
          </div>

          {step === "CHECKIN" && (
            <p className="text-xs text-slate-500">
              Fields marked with <span className="text-red-500">*</span> are mandatory
            </p>
          )}
        </div>

        <div className="px-8 py-10 md:px-12 md:py-14 space-y-8">

          <div className="flex gap-2">
            {["CHECKIN", "OTP", "PRESETUP", "POSTSETUP", "DONE"].map((s) => (
              <div
                key={s}
                className={`h-0.5 flex-1 rounded ${["CHECKIN", "OTP", "PRESETUP", "POSTSETUP", "DONE"].indexOf(step) >=
                    ["CHECKIN", "OTP", "PRESETUP", "POSTSETUP", "DONE"].indexOf(s)
                    ? "bg-slate-800"
                    : "bg-slate-200"
                  }`}
              />
            ))}
          </div>

          {step === "CHECKIN" && (
            <div className="space-y-6 max-w-sm">
              <h2 className="text-lg font-semibold">Vendor Check-In</h2>

              {[
                { label: "Vendor ID", value: vendorId, set: setVendorId },
                { label: "Latitude", value: latitude, set: setLatitude },
                { label: "Longitude", value: longitude, set: setLongitude },
              ].map((f) => (
                <div key={f.label} className="space-y-1">
                  <label className="text-sm font-medium">
                    {f.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                  />
                </div>
              ))}

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Photo <span className="text-red-500">*</span>
                </label>
                <label className="flex justify-between items-center border rounded-md px-4 py-2 cursor-pointer">
                  <span className="text-sm text-slate-500">
                    {checkinPhoto ? checkinPhoto.name : "Upload a photo"}
                  </span>
                  <span className="text-sm font-medium">Browse</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && setCheckinPhoto(e.target.files[0])
                    }
                  />
                </label>
              </div>

              <button
                onClick={handleCheckIn}
                className="w-full bg-slate-800 text-white py-2.5 rounded-md"
              >
                Confirm Check-In
              </button>
            </div>
          )}

          {step === "OTP" && (
            <div className="space-y-6 max-w-sm">
              <h2 className="text-lg font-semibold">OTP Verification</h2>

              <button
                onClick={handleSendOtp}
                className="w-full border py-2 rounded-md text-sm"
              >
                Send OTP
              </button>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  OTP <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-center tracking-widest"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full bg-slate-800 text-white py-2.5 rounded-md"
              >
                Verify & Continue
              </button>
            </div>
          )}

          {step === "PRESETUP" && (
            <div className="space-y-6 max-w-sm">
              <h2 className="text-lg font-semibold">Pre-Setup Documentation</h2>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Photo <span className="text-red-500">*</span>
                </label>
                <label className="flex justify-between items-center border rounded-md px-4 py-2 cursor-pointer">
                  <span className="text-sm text-slate-500">
                    {prePhoto ? prePhoto.name : "Upload a photo"}
                  </span>
                  <span className="text-sm font-medium">Browse</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && setPrePhoto(e.target.files[0])
                    }
                  />
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 min-h-[96px]"
                  placeholder="Add setup notes"
                  value={preNotes}
                  onChange={(e) => setPreNotes(e.target.value)}
                />
              </div>

              <button
                onClick={handlePreSetup}
                className="w-full bg-slate-800 text-white py-2.5 rounded-md"
              >
                Save Pre-Setup
              </button>
            </div>
          )}

          {step === "POSTSETUP" && (
            <div className="space-y-6 max-w-sm">
              <h2 className="text-lg font-semibold">Post-Setup Completion</h2>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Photo <span className="text-red-500">*</span>
                </label>
                <label className="flex justify-between items-center border rounded-md px-4 py-2 cursor-pointer">
                  <span className="text-sm text-slate-500">
                    {postPhoto ? postPhoto.name : "Upload a photo"}
                  </span>
                  <span className="text-sm font-medium">Browse</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && setPostPhoto(e.target.files[0])
                    }
                  />
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 min-h-[96px]"
                  placeholder="Completion notes"
                  value={postNotes}
                  onChange={(e) => setPostNotes(e.target.value)}
                />
              </div>

              <button
                onClick={handlePostSetup}
                className="w-full bg-emerald-700 text-white py-2.5 rounded-md"
              >
                Complete Event
              </button>
            </div>
          )}

          {step === "DONE" && (
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-emerald-700">
                Event Completed
              </h2>
              <p className="text-sm text-slate-600">
                All documentation has been recorded successfully.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
