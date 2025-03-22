
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Handshake, Shield } from 'lucide-react';

const features = [
  {
    title: 'Loan Repayment Flexibility',
    description: 'Repay loans with services, products, or partial cash payments based on your strengths and situation.',
    icon: <Handshake className="h-6 w-6" />,
  },
  {
    title: 'Transparent Negotiation',
    description: 'Openly negotiate terms and valuations with complete transparency between lenders and borrowers.',
    icon: <Check className="h-6 w-6" />,
  },
  {
    title: 'Trust-Based System',
    description: 'Build reputation through our comprehensive rating system that tracks reliability and quality.',
    icon: <Shield className="h-6 w-6" />,
  },
  {
    title: '72-Hour Dispute Window',
    description: 'Fair resolution process with a 72-hour window to report any issues after service or product delivery.',
    icon: <Clock className="h-6 w-6" />,
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Reimagining How Loans Work
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Our platform transforms traditional lending with features designed for flexibility and trust
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="glass-card group hover:shadow-elevation transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-md bg-primary-foreground flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
