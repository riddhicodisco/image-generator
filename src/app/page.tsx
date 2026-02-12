"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import {
  Upload,
  Package,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [shippingCharge, setShippingCharge] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Shipping Calculator State
  const [calcWeight, setCalcWeight] = useState("");
  const [calcZone, setCalcZone] = useState<"LOCAL" | "REGIONAL" | "NATIONAL">(
    "LOCAL",
  );
  const [calcResult, setCalcResult] = useState<{
    charge: number;
    slab: string;
    zone: string;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
      setIsComplete(false);
      setGeneratedImages([]);
      setShippingCharge(null);
    }
  };

  const handleGenerate = async () => {
    if (!image) {
      setError("Please upload a product image first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setIsComplete(false);
    setGeneratedImages([]);
    setShippingCharge(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("categoryId", selectedCategory);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          throw new Error(data.error || `Server error: ${response.status}`);
        } catch (e) {
          console.error("Server response not JSON:", text);
          throw new Error(
            `Server error (${response.status}): The server returned an invalid response.`,
          );
        }
      }

      const data = await response.json();
      console.log("Client: Response data received:", data);

      if (!data.variants || !Array.isArray(data.variants)) {
        throw new Error(
          "Invalid server response: 'variants' is missing or not an array.",
        );
      }

      setGeneratedImages(data.variants);
      setShippingCharge(data.shippingCharge);
      setIsComplete(true);
    } catch (err: unknown) {
      console.error("Client: Upload error:", err);
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadSingleImage = async (imgUrl: string) => {
    try {
      const response = await fetch(imgUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const filename = imgUrl.split("/").pop() || "variant.png";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const handleDownloadAllImages = async () => {
    if (generatedImages.length === 0) return;

    try {
      // Create a zip file using JSZip (you'll need to install this package)
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Download all images and add to zip
      const imagePromises = generatedImages.map(async (imgUrl, index) => {
        const response = await fetch(imgUrl);
        if (!response.ok)
          throw new Error(`Failed to download image ${index + 1}`);
        const blob = await response.blob();
        const filename = imgUrl.split("/").pop() || `variant_${index + 1}.png`;
        zip.file(filename, blob);
      });

      await Promise.all(imagePromises);

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = window.URL.createObjectURL(zipBlob);

      // Download zip
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `meesho_images_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(zipUrl);
    } catch (err) {
      console.error("Batch download error:", err);
      alert(
        "Failed to download all images. Please try downloading individually.",
      );
    }
  };

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcWeight || isNaN(Number(calcWeight))) {
      setCalcError("Please enter a valid weight in kg (e.g., 0.5).");
      return;
    }

    setIsCalculating(true);
    setCalcError(null);
    setCalcResult(null);

    try {
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: Number(calcWeight), zone: calcZone }),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          throw new Error(
            data.error || `Calculation failed: ${response.status}`,
          );
        } catch (e) {
          console.error("Calculation response not JSON:", text);
          throw new Error(
            `Calculation failed (${response.status}): Invalid server response.`,
          );
        }
      }

      const data = await response.json();
      setCalcResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setCalcError(message);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
              MEESO SUPPLIER TOOLS
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 tracking-tight sm:text-6xl"
          >
            Meesho Image Generator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-xl text-slate-600 font-medium"
          >
            Transform one product image into 50 marketplace-ready variations
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-wrap justify-center gap-4"
          >
            <div className="flex items-center text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              No AI Used - 100% Safe
            </div>
            <div className="flex items-center text-sm text-slate-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Meesho Approved Templates
            </div>
            <div className="flex items-center text-sm text-slate-500">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Auto Shipping Calculator
            </div>
          </motion.div>
        </div>

        {/* Main Upload Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-0 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Package className="mr-3 h-7 w-7" />
              Generate Meesho Images
            </h2>
          </div>
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Category & Upload */}
              <div className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                    <Package className="mr-2 h-4 w-4 text-orange-500" />
                    Product Category
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="block w-full pl-4 pr-10 py-4 text-base border-2 border-orange-200 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-xl appearance-none transition-all cursor-pointer hover:border-orange-300 font-medium"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-orange-500">
                      <Package className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Select category for accurate shipping calculation
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Product Image
                  </label>
                  <div
                    className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-3 border-dashed rounded-2xl transition-all ${
                      preview
                        ? "border-orange-300 bg-orange-50"
                        : "border-orange-200 hover:border-orange-400 bg-gradient-to-br from-orange-50 to-red-50"
                    }`}
                  >
                    <div className="space-y-4 text-center">
                      {preview ? (
                        <div className="relative inline-block">
                          <img
                            src={preview}
                            alt="Preview"
                            className="mx-auto h-56 w-56 object-contain rounded-xl shadow-lg border-2 border-white"
                          />
                          <button
                            onClick={() => {
                              setPreview(null);
                              setImage(null);
                            }}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-all"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="mx-auto h-20 w-20 text-orange-400">
                            <Upload className="h-full w-full" />
                          </div>
                          <div className="flex text-sm text-slate-600">
                            <label className="relative cursor-pointer bg-white rounded-xl font-bold text-orange-600 hover:text-orange-500 focus-within:outline-none px-4 py-2 border-2 border-orange-200 hover:border-orange-300 transition-all">
                              <span>Choose Image</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="pl-3 py-2">or drag & drop</p>
                          </div>
                          <p className="text-xs text-slate-500">
                            PNG, JPG, WebP up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Info & Action */}
              <div className="space-y-6">
                {/* Features */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                  <h3 className="font-bold text-slate-900 mb-4 text-lg">
                    What You'll Get
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        icon: "🎨",
                        title: "50 Unique Variations",
                        desc: "Different layouts, borders, and stickers",
                      },
                      {
                        icon: "🚚",
                        title: "Auto Shipping",
                        desc: "Calculated based on product category",
                      },
                      {
                        icon: "✅",
                        title: "Marketplace Ready",
                        desc: "Optimized for Meesho standards",
                      },
                      {
                        icon: "🔒",
                        title: "100% Safe",
                        desc: "No AI - content never altered",
                      },
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <span className="text-2xl">{feature.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">
                            {feature.title}
                          </p>
                          <p className="text-xs text-slate-600">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {!isComplete ? (
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !image}
                      className={`w-full flex items-center justify-center py-5 px-6 border-2 border-transparent rounded-2xl shadow-lg text-xl font-bold text-white transition-all transform ${
                        isGenerating || !image
                          ? "bg-slate-300 cursor-not-allowed"
                          : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-95 shadow-xl hover:shadow-2xl"
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="animate-spin -ml-1 mr-3 h-6 w-6" />
                          Generating 50 Variations...
                        </>
                      ) : (
                        <>
                          <Package className="mr-3 h-6 w-6" />
                          Generate Meesho Images
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center p-6 text-green-800 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                        <div className="flex items-center mb-3">
                          <CheckCircle2 className="flex-shrink-0 w-8 h-8 mr-3 text-green-600" />
                          <span className="text-xl font-bold">
                            Successfully generated 50 images!
                          </span>
                        </div>
                        {shippingCharge && (
                          <div className="text-sm font-bold text-green-700 bg-green-100 px-4 py-2 rounded-full">
                            Standard Shipping: ₹{shippingCharge}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setIsComplete(false);
                          setGeneratedImages([]);
                        }}
                        className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors py-3"
                      >
                        ← Generate More Images
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 flex items-center p-4 text-red-800 rounded-xl bg-red-50 border-2 border-red-100"
                >
                  <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Generated Images Grid */}
        <AnimatePresence>
          {isComplete && generatedImages && generatedImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Generated Variations
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {generatedImages.map((imgUrl, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-slate-200 group"
                  >
                    <div className="aspect-square relative overflow-hidden bg-slate-100">
                      <img
                        src={imgUrl}
                        alt={`Variation ${idx + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                      {shippingCharge && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                          ₹{shippingCharge}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <button
                        onClick={() => handleDownloadSingleImage(imgUrl)}
                        className="w-full flex items-center justify-center py-2 px-3 border border-transparent rounded-lg text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shipping Calculator section */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Package className="mr-2 h-6 w-6 text-indigo-600" />
              Meesho Shipping Calculator
            </h2>
            <form
              onSubmit={handleCalculateShipping}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Product Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(e.target.value)}
                  placeholder="e.g. 0.45"
                  className="block w-full px-4 py-3 text-sm border-slate-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Destination Zone
                </label>
                <select
                  value={calcZone}
                  onChange={(e) =>
                    setCalcZone(
                      e.target.value as "LOCAL" | "REGIONAL" | "NATIONAL",
                    )
                  }
                  className="block w-full px-4 py-3 text-sm border-slate-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="LOCAL">Local</option>
                  <option value="REGIONAL">Regional</option>
                  <option value="NATIONAL">National</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isCalculating}
                  className="w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:bg-slate-300"
                >
                  {isCalculating ? (
                    <RefreshCw className="animate-spin h-5 w-5" />
                  ) : (
                    "Calculate Shipping"
                  )}
                </button>
              </div>
            </form>

            {calcError && (
              <div className="mt-6 flex items-center p-4 text-red-800 rounded-lg bg-red-50 border border-red-100">
                <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3" />
                <span className="text-sm font-medium">{calcError}</span>
              </div>
            )}

            {calcResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100"
              >
                <p className="text-sm text-indigo-600 font-bold uppercase tracking-wider mb-2">
                  Calculation Result
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900">
                      ₹{calcResult.charge}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Weight Slab:{" "}
                      <span className="font-bold">{calcResult.slab}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <CheckCircle2 className="h-8 w-8 text-green-500 ml-auto" />
                    <p className="text-xs text-slate-500 mt-1">
                      Zone: {calcResult.zone}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              title: "No AI Used",
              desc: "Content is never altered, ensuring marketplace safety.",
            },
            {
              title: "50 Variations",
              desc: "Unique layouts, borders, and stickers for maximum reach.",
            },
            {
              title: "Marketplace Ready",
              desc: "Pre-sized and styled for professional platforms.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
            >
              <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
