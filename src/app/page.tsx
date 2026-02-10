'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/constants';
import { Upload, Package, Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    }
  };

  const handleGenerate = async () => {
    if (!image) {
      setError('Please upload a product image first.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setIsComplete(false);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('categoryId', selectedCategory);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setZipUrl(url);
      setIsComplete(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (zipUrl) {
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `marketplace-images-${selectedCategory}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl"
          >
            Marketplace Generator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-slate-600"
          >
            Generate 57 marketplace-ready variations from one image.
          </motion.p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-8">
            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Product Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full pl-4 pr-10 py-3 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border appearance-none transition-all cursor-pointer hover:border-slate-400"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Product Image
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all ${preview ? 'border-indigo-300 bg-indigo-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                >
                  <div className="space-y-2 text-center">
                    {preview ? (
                      <div className="relative inline-block">
                        <img
                          src={preview}
                          alt="Preview"
                          className="mx-auto h-48 w-48 object-contain rounded-md"
                        />
                        <button
                          onClick={() => { setPreview(null); setImage(null); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG, WebP up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center p-4 text-red-800 rounded-lg bg-red-50 border border-red-100"
                  >
                    <AlertCircle className="flex-shrink-0 w-5 h-5 mr-3" />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="pt-4">
                {!isComplete ? (
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !image}
                    className={`w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white transition-all ${isGenerating || !image
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-95'
                      }`}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="animate-spin -ml-1 mr-3 h-6 w-6" />
                        Generating 57 Variations...
                      </>
                    ) : (
                      'Generate Images'
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center p-4 text-green-800 rounded-lg bg-green-50 border border-green-100 mb-4">
                      <CheckCircle2 className="flex-shrink-0 w-6 h-6 mr-3 text-green-600" />
                      <span className="text-lg font-bold">Successfully generated 57 images!</span>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-green-600 hover:bg-green-700 active:transform active:scale-95 transition-all"
                    >
                      <Download className="-ml-1 mr-3 h-6 w-6" />
                      Download ZIP File
                    </button>
                    <button
                      onClick={() => { setIsComplete(false); setZipUrl(null); }}
                      className="w-full text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    >
                      Start Over
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { title: 'No AI Used', desc: 'Content is never altered, ensuring marketplace safety.' },
            { title: '57 Variations', desc: 'Unique layouts, borders, and stickers for maximum reach.' },
            { title: 'Marketplace Ready', desc: 'Pre-sized and styled for professional platforms.' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
