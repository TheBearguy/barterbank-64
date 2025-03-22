
import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Post Your Loan Request',
    description: 'Specify the amount needed and what services or products you can offer as repayment.'
  },
  {
    number: '02',
    title: 'Receive Offers from Lenders',
    description: 'Multiple lenders can show interest in your request with their specific terms.'
  },
  {
    number: '03',
    title: 'Choose Your Lender',
    description: 'Select the best offer for you based on their terms and reputation on the platform.'
  },
  {
    number: '04',
    title: 'Negotiate Repayment Details',
    description: 'Agree on specific services, products, and any cash components of the repayment.'
  },
  {
    number: '05',
    title: 'Complete the Exchange',
    description: 'Provide the agreed services or products, which are then confirmed by the lender.'
  },
  {
    number: '06',
    title: 'Build Your Reputation',
    description: 'Get rated on your reliability, enabling better future exchange opportunities.'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How BarterBank Works
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            A simple six-step process to exchange value flexibly
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-subtle p-6 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="absolute -right-4 -top-4 text-8xl font-bold text-gray-100 dark:text-gray-800 select-none">
                {step.number}
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
