import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dna, Leaf, Brain, BarChart3, Shield, Users, ArrowRight, ChevronRight } from 'lucide-react';

import cropRice from '@/assets/crop-rice.jpg';
import cropWheat from '@/assets/crop-wheat.jpg';
import cropCorn from '@/assets/crop-corn.jpg';

const features = [
  {
    icon: Dna,
    title: 'Genetic Analysis',
    description: 'Analyze genetic markers and traits to understand crop characteristics and inheritance patterns.',
  },
  {
    icon: Leaf,
    title: 'Crop Recommendations',
    description: 'Get AI-powered recommendations based on soil, climate, and genetic data.',
  },
  {
    icon: Brain,
    title: 'ML Predictions',
    description: 'Advanced machine learning models for yield prediction and performance scoring.',
  },
  {
    icon: BarChart3,
    title: 'Data Visualization',
    description: 'Interactive charts and dashboards for comprehensive data analysis.',
  },
];

const cropImages = [
  { src: cropRice, alt: 'Rice paddy field', label: 'Rice' },
  { src: cropWheat, alt: 'Wheat field', label: 'Wheat' },
  { src: cropCorn, alt: 'Corn field', label: 'Corn' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/rvce-logo.png" alt="RVCE Logo" className="h-12 w-auto" />
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/login?mode=signup">
              <Button variant="hero">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto text-center relative">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Genetic Traits & Crop<br />
              <span className="text-gradient">Recommendation System</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Harness the power of machine learning to analyze genetic traits, predict crop yields,
              and make data-driven agricultural decisions. Built for researchers and agronomists.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login?mode=signup">
                <Button variant="hero" size="xl">
                  Start Analyzing
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Crop Images */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            {cropImages.map((crop, i) => (
              <div key={i} className="relative group overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={crop.src}
                  alt={crop.alt}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white font-semibold text-lg">
                  {crop.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Agricultural Research
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to analyze genetic data, predict crop performance,
              and make informed decisions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card variant="elevated" className="h-full hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img src="/rvce-logo.png" alt="RVCE Logo" className="h-10 w-auto" />
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                A Comprehensive Genetic Traits & Crop Recommendation System developed for agricultural research and yield optimization.
              </p>
            </div>

            <div className="flex flex-col gap-4 md:items-end">
              <h3 className="font-bold text-lg text-foreground mb-2">Contributors</h3>
              <div className="text-sm text-muted-foreground space-y-2 md:text-right">
                <p className="font-medium text-foreground">Department of Artificial Intelligence and Machine Learning</p>
                <div className="space-y-1">
                  <p>Manya Sharma — 1RV23AI053</p>
                  <p>Nishan Shetty — 1RV23AI068</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
