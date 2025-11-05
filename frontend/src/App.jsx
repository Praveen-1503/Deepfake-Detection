import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UploadCloud, Cpu, Zap, Lock, ChevronDown, ChevronUp, Twitter, Linkedin, Github, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import './App.css'

// Main App Component
const App = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Animation Variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const cardHover = {
    scale: 1.03,
    transition: { duration: 0.3 }
  };

  // Handle smooth scrolling for navigation
  const handleNavClick = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
    }
  };
  
  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        setImage(file);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);


  // Create image preview and simulate analysis
  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    
    // Simulate API call and analysis
    setIsLoading(true);
    setResult(null);
    const timer = setTimeout(() => {
        const detection = Math.random() > 0.5 ? 'Real' : 'Deepfake';
        const confidence = (Math.random() * (99.9 - 95.5) + 95.5).toFixed(2);
        setResult({ detection, confidence });
        setIsLoading(false);
    }, 2000); // 2-second delay

    // Cleanup
    return () => {
        clearTimeout(timer);
        URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  
  const resetUploader = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setIsLoading(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const faqData = [
    {
      question: "How accurate is Real Reveal's detection?",
      answer: "Our model is trained on a vast and diverse dataset of real and deepfake images, achieving over 98% accuracy in our benchmark tests. We continuously update our algorithms to counter the latest generation techniques."
    },
    {
      question: "What types of image formats can I upload?",
      answer: "Currently, we support JPEG, PNG, and WEBP formats. We are working on expanding our support to include more formats and even video analysis in the future."
    },
    {
      question: "Is my data secure when I upload an image?",
      answer: "Absolutely. We prioritize your privacy and security. Uploaded images are analyzed in a secure, isolated environment and are automatically deleted from our servers after 24 hours. We do not store or share your data."
    },
  ];

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-gray-300">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-gray-900/70 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-700"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-white tracking-tight">Real Reveal</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#tech" onClick={handleNavClick} className="text-gray-400 hover:text-blue-400 transition-colors">Technology</a>
            <a href="#features" onClick={handleNavClick} className="text-gray-400 hover:text-blue-400 transition-colors">Features</a>
            <a href="#faq" onClick={handleNavClick} className="text-gray-400 hover:text-blue-400 transition-colors">FAQ</a>
          </nav>
          <motion.a 
            href="#upload" 
            onClick={handleNavClick}
            whileHover={{ scale: 1.05, boxShadow: '0px 0px 12px rgb(59 130 246 / 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:inline-block bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg transition-all shadow-md"
          >
            Check Image
          </motion.a>
        </div>
      </motion.header>

      <main className="pt-20">
        {/* Hero Section */}
        <section id="upload" className="text-center py-20 md:py-24 bg-gray-900 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-900/50 rounded-full blur-3xl animate-pulse"></div>
            <div className="container mx-auto px-6 relative z-10">
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                      Detect Digital Forgeries with AI
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                      Real Reveal's advanced neural networks provide the ultimate defense against sophisticated deepfake images. Upload an image to see the truth.
                    </motion.p>
                </motion.div>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-8"
                >
                    <div 
                        className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-xl p-8 md:p-12 max-w-2xl mx-auto hover:border-blue-500 transition-all cursor-pointer group backdrop-blur-sm"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current.click()}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                      <UploadCloud className="w-16 h-16 text-gray-500 mx-auto mb-4 group-hover:text-blue-400 transition-colors" />
                      <h3 className="text-xl font-semibold text-white mb-2">Drag & Drop Your Image Here</h3>
                      <p className="text-gray-500 mb-6">or click to browse files</p>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-transform transform shadow-lg shadow-blue-600/30"
                      >
                        Upload Image
                      </motion.button>
                    </div>
                </motion.div>
                
                {/* Results Section */}
                <AnimatePresence>
                {(preview || isLoading) && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.5 }}
                        className="mt-12 max-w-3xl mx-auto"
                    >
                        <div className="bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm border border-gray-700">
                            <h3 className="text-2xl font-bold text-white mb-6">Analysis Result</h3>
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                                    {preview && <img src={preview} alt="Uploaded preview" className="w-full h-full object-cover"/>}
                                </div>
                                <div className="text-left min-h-[150px]">
                                    <AnimatePresence mode="wait">
                                    {isLoading && (
                                        <motion.div 
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center justify-center h-full"
                                        >
                                            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                            <p className="text-lg text-gray-300">Analyzing image...</p>
                                        </motion.div>
                                    )}
                                    {result && (
                                        <motion.div 
                                            key="result"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="flex flex-col items-center md:items-start"
                                        >
                                            {result.detection === 'Real' ? (
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                                    <p className="text-3xl font-bold text-green-400">Authentic</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <XCircle className="w-12 h-12 text-red-500" />
                                                    <p className="text-3xl font-bold text-red-400">Deepfake Detected</p>
                                                </div>
                                            )}
                                            <p className="text-lg text-gray-300">Confidence: <span className="font-bold text-white">{result.confidence}%</span></p>
                                            <motion.button 
                                                onClick={resetUploader} 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="mt-6 bg-gray-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                Check Another Image
                                            </motion.button>
                                        </motion.div>
                                    )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </section>

        {/* Sections with scroll animations */}
        {[
          {
            id: 'how-it-works',
            bgColor: 'bg-gray-800',
            title: 'Simple Steps to Certainty',
            subtitle: 'Our process is designed for speed and simplicity. Get your results in seconds.',
            content: (
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: 'Upload Image', description: 'Securely upload the image you want to analyze. We respect your privacy.' },
                  { title: 'AI Analysis', description: 'Our advanced neural network scans for subtle artifacts and inconsistencies.' },
                  { title: 'Get Results', description: 'Receive a clear authenticity score and a detailed report in real-time.' }
                ].map((step, index) => (
                  <motion.div key={index} variants={itemVariants} whileHover={cardHover} className="bg-gray-900/50 p-8 rounded-lg border border-gray-700">
                    <div className="bg-blue-900/50 border-2 border-blue-500 text-blue-300 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4 mx-auto">{index + 1}</div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            )
          },
          {
            id: 'tech',
            bgColor: 'bg-gray-900',
            title: 'Powered by Advanced AI',
            subtitle: 'We utilize a multi-layered approach to deepfake detection, ensuring the highest level of accuracy.',
            content: (
              <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                {[
                  { icon: Cpu, title: 'Neural Networks', description: 'Our core model uses sophisticated CNNs to analyze pixel-level data for manipulation patterns.' },
                  { icon: Zap, title: 'Spectral Analysis', description: 'We analyze images in the frequency domain to detect artifacts left by generative models.' },
                  { icon: Lock, title: 'Continual Learning', description: 'Our models are constantly retrained on new deepfake techniques to stay ahead of threats.' }
                ].map((tech, index) => (
                  <motion.div key={index} variants={itemVariants} whileHover={cardHover} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <tech.icon className="w-10 h-10 text-blue-500 mb-4" />
                    <h4 className="font-semibold text-lg text-white mb-2">{tech.title}</h4>
                    <p className="text-gray-400">{tech.description}</p>
                  </motion.div>
                ))}
              </div>
            )
          }
        ].map(section => (
          <motion.section 
            key={section.id} 
            id={section.id} 
            className={`py-20 ${section.bgColor}`}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="container mx-auto px-6 text-center">
              <motion.div variants={itemVariants}>
                <h2 className="text-3xl font-bold text-white mb-3">{section.title}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mb-12">{section.subtitle}</p>
              </motion.div>
              {section.content}
            </div>
          </motion.section>
        ))}

        {/* Features Section */}
        <motion.section 
            id="features" 
            className="py-20 bg-gray-800"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
        >
          <div className="container mx-auto px-6">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">An Unparalleled Detection Engine</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <motion.div variants={itemVariants}>
                    <img src="https://placehold.co/600x400/1f2937/4f46e5?text=Feature+Visual" alt="Feature Visualization" className="rounded-lg shadow-lg" />
                </motion.div>
                <motion.div variants={itemVariants} className="space-y-6">
                    {[
                        { icon: Zap, title: "Blazing Fast Results", description: "Get a comprehensive analysis in under 5 seconds. No waiting, just answers." },
                        { icon: ShieldCheck, title: "High Accuracy", description: "Our industry-leading AI model provides reliable and trustworthy results." },
                        { icon: Lock, title: "Privacy First", description: "Your images are your own. We analyze them and then delete them. Simple as that." }
                    ].map((feature, index) => (
                        <div key={index} className="flex items-start">
                            <feature.icon className="w-7 h-7 text-blue-500 mr-4 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
            id="faq" 
            className="py-20 bg-gray-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
        >
          <div className="container mx-auto px-6 max-w-3xl">
            <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center text-white mb-10">Frequently Asked Questions</motion.h2>
            <motion.div variants={itemVariants} className="space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center p-5 text-left font-semibold text-white focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <motion.div animate={{ rotate: openFaq === index ? 180 : 0 }}>
                        <ChevronDown className="w-5 h-5 text-blue-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-gray-400 border-t border-gray-700 pt-4">
                        <p>{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold text-white">Real Reveal</span>
              </div>
              <p className="text-gray-400">Fighting digital deception with AI.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-200 mb-4 tracking-wider uppercase">Links</h3>
              <ul className="space-y-2">
                <li><a href="#tech" onClick={handleNavClick} className="text-gray-400 hover:text-blue-400 transition-colors">Technology</a></li>
                <li><a href="#features" onClick={handleNavClick} className="text-gray-400 hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#faq" onClick={handleNavClick} className="text-gray-400 hover:text-blue-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-200 mb-4 tracking-wider uppercase">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Twitter className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Linkedin className="w-6 h-6" /></a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Github className="w-6 h-6" /></a>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Real Reveal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
