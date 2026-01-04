
import React from 'react';
import { Project } from './types';

export const ADMIN_EMAIL = 'dilmandilan367@gmail.com';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Advanced Data Scraper',
    type: 'PYTHON',
    price: 49.99,
    description: 'A powerful Python script to scrape any dynamic website using Selenium and BeautifulSoup.',
    longDescription: 'This project provides a robust framework for extracting data from complex web applications. It includes automatic proxy rotation, headless browser support, and multi-threaded processing to speed up data collection. Perfect for market research and competitive analysis.',
    imageUrl: 'https://picsum.photos/seed/py1/800/600',
    features: ['Concurrent scraping', 'CSV/JSON Export', 'Proxy support', 'Error logging']
  },
  {
    id: '2',
    name: 'E-commerce UI Kit',
    type: 'HTML',
    price: 29.99,
    description: 'Modern HTML/Tailwind template for building high-conversion landing pages.',
    longDescription: 'A premium HTML template built with utility-first CSS. It includes over 20 pre-built components, responsive design, and optimized performance. Easily customizable and ready for integration with any backend framework.',
    imageUrl: 'https://picsum.photos/seed/html1/800/600',
    features: ['Fully Responsive', 'Tailwind Config included', 'Light/Dark mode', 'SEO Optimized']
  },
  {
    id: '3',
    name: 'Automated Trading Bot',
    type: 'PYTHON',
    price: 199.99,
    description: 'A sophisticated bot that executes trades based on technical indicators.',
    longDescription: 'Leverage the power of Python to automate your trading strategy. This bot connects to major exchanges via API, monitors price movements, and executes buy/sell orders based on RSI and Moving Averages. Includes a backtesting module.',
    imageUrl: 'https://picsum.photos/seed/py2/800/600',
    features: ['API Integration', 'Backtesting engine', 'Live notifications', 'Strategy builder']
  },
  {
    id: '4',
    name: 'Portfolio Template',
    type: 'HTML',
    price: 15.00,
    description: 'Sleek and minimal portfolio for developers and designers.',
    longDescription: 'Showcase your work with style. This HTML template features smooth scrolling, lazy loading images, and a clean contact form. Perfect for presenting projects to potential employers or clients.',
    imageUrl: 'https://picsum.photos/seed/html2/800/600',
    features: ['Clean Code', 'Animation Support', 'Custom Icons', 'Fast Loading']
  },
  {
    id: '5',
    name: 'Machine Learning Image Classifier',
    type: 'PYTHON',
    price: 89.00,
    description: 'Pre-trained CNN model for classifying images into various categories.',
    longDescription: 'Jumpstart your AI project with this pre-trained classifier. Using TensorFlow and Keras, this script can identify thousands of object categories with high accuracy. Includes training scripts for custom datasets.',
    imageUrl: 'https://picsum.photos/seed/py3/800/600',
    features: ['Pre-trained weights', 'Web API wrapper', 'Data augmentation', 'Visualization tools']
  }
];

export const Icons = {
  Python: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M11.996 0c-3.14 0-2.943 1.36-2.943 1.36l.013 1.41h2.98v.418H7.957S5.034 2.872 5.034 6.276c0 3.403 2.58 3.284 2.58 3.284h1.542v-2.18s-.036-2.618 2.56-2.618h4.31s2.515.064 2.515-2.5c0-2.563-2.223-2.262-2.223-2.262H11.996zM7.222 4.14a.65.65 0 110 1.3.65.65 0 010-1.3zm4.774 19.86c3.14 0 2.943-1.36 2.943-1.36l-.012-1.41h-2.981v-.418h4.089s2.923.316 2.923-3.088c0-3.404-2.58-3.284-2.58-3.284h-1.542v2.18s.036 2.618-2.56 2.618H9.967s-2.515-.064-2.515 2.5c0 2.563 2.223 2.262 2.223 2.262h2.321zm4.774-4.14a.65.65 0 110-1.3.65.65 0 010 1.3z" />
    </svg>
  ),
  Html: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z" />
    </svg>
  )
};
