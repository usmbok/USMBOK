import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, ArrowLeft } from 'lucide-react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const faqData = [
    {
      category: 'Account Management',
      items: [
        {
          id: 1,
          question: 'How do I create an account on USMBOK?',
          answer: 'To create an account, click on "Get Started" in the navigation bar and fill out the registration form with your email, password, and basic information. You\'ll receive an email verification link to activate your account.'
        },
        {
          id: 2,
          question: 'How can I update my profile information?',
          answer: 'Navigate to Account Settings from your account menu dropdown. In the Profile section, you can update your name, email, and other personal information. Changes are automatically saved when you click "Save Changes".'
        },
        {
          id: 3,
          question: 'How do I change my password?',
          answer: 'Go to Account Settings and click on the Security section. Enter your current password and your new password twice for confirmation. Click "Update Password" to save the changes.'
        }
      ]
    },
    {
      category: 'Credit System',
      items: [
        {
          id: 4,
          question: 'What are credits and how do they work?',
          answer: 'Credits are the currency used for AI consultations on USMBOK. Each AI conversation or consultation consumes a certain number of credits based on the complexity and length of the interaction. You can purchase credit bundles or subscribe to plans that include monthly credits.'
        },
        {
          id: 5,
          question: 'How do I purchase more credits?',
          answer: 'Visit the Credit Management page from your account menu or click "Upgrade" in the navigation. Choose from various credit bundles or subscription plans. We accept major credit cards through our secure payment processor.'
        },
        {
          id: 6,
          question: 'Do my credits expire?',
          answer: 'Credits purchased individually expire after 12 months from the purchase date. However, credits included in subscription plans renew monthly and don\'t carry over to the next billing cycle.'
        },
        {
          id: 7,
          question: 'How can I check my current credit balance?',
          answer: 'Your current credit balance is displayed in the header navigation when you\'re logged in. You can also view detailed usage analytics and transaction history in the Credit Management section.'
        }
      ]
    },
    {
      category: 'AI Consultations',
      items: [
        {
          id: 8,
          question: 'How do I start an AI consultation?',
          answer: 'Click on "Companion" in the navigation to access the AI chat interface. Select your domain of expertise or choose "Cross-Domain" for general inquiries. Type your question or describe your challenge to begin the consultation.'
        },
        {
          id: 9,
          question: 'What types of questions can I ask?',
          answer: 'You can ask questions related to business management, strategy, operations, human resources, finance, marketing, and more. Our AI is trained on USMBOK (United States Management Body of Knowledge) principles and best practices.'
        },
        {
          id: 10,
          question: 'Can I save or export my consultation history?',
          answer: 'Yes, all your consultations are automatically saved and can be accessed through the Conversation History page. You can search, filter, and export your conversations for future reference.'
        }
      ]
    },
    {
      category: 'Technical Support',
      items: [
        {
          id: 11,
          question: 'The AI is not responding to my questions. What should I do?',
          answer: 'First, check your internet connection and try refreshing the page. Ensure you have sufficient credits for the consultation. If the issue persists, try clearing your browser cache or contact our support team.'
        },
        {
          id: 12,
          question: 'Why am I experiencing slow response times?',
          answer: 'Response times can vary based on server load and the complexity of your query. Complex questions requiring detailed analysis may take longer. If you consistently experience slow responses, please contact support.'
        },
        {
          id: 13,
          question: 'Can I use USMBOK on mobile devices?',
          answer: 'Yes, USMBOK is fully responsive and optimized for mobile devices. You can access all features through your mobile browser. We recommend using the latest version of Chrome, Safari, or Firefox for the best experience.'
        }
      ]
    },
    {
      category: 'Billing',
      items: [
        {
          id: 14,
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover) and PayPal. All payments are processed securely through encrypted connections.'
        },
        {
          id: 15,
          question: 'How do I cancel my subscription?',
          answer: 'You can cancel your subscription anytime from the Credit Management page. Click on "Manage Subscription" and follow the cancellation process. You\'ll retain access until the end of your current billing period.'
        },
        {
          id: 16,
          question: 'Can I get a refund for unused credits?',
          answer: 'Refund policies vary based on your subscription type. Individual credit purchases are generally non-refundable, but we handle refund requests on a case-by-case basis. Contact support for specific refund inquiries.'
        }
      ]
    }
  ];

  const categories = ['All', ...new Set(faqData.map(section => section.category))];

  const toggleExpand = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded?.has(itemId)) {
      newExpanded?.delete(itemId);
    } else {
      newExpanded?.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqData?.map(section => ({
      ...section,
      items: section?.items?.filter(item => {
        const matchesSearch = searchQuery === '' || 
          item?.question?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
          item?.answer?.toLowerCase()?.includes(searchQuery?.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || section?.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    }))?.filter(section => section?.items?.length > 0);

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text?.split(new RegExp(`(${query})`, 'gi'));
    return parts?.map((part, index) =>
      part?.toLowerCase() === query?.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about USMBOK's AI consultation platform
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="pl-10 pr-4 py-3 w-full"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories?.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="space-y-8">
            {filteredFAQs?.length > 0 ? (
              filteredFAQs?.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
                    {section?.category}
                  </h2>
                  
                  <div className="space-y-2">
                    {section?.items?.map((item) => (
                      <div
                        key={item?.id}
                        className="border border-border rounded-lg overflow-hidden bg-card"
                      >
                        <button
                          onClick={() => toggleExpand(item?.id)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <h3 className="text-base font-medium text-card-foreground pr-4">
                            {highlightText(item?.question, searchQuery)}
                          </h3>
                          {expandedItems?.has(item?.id) ? (
                            <ChevronUp className="flex-shrink-0 text-muted-foreground" size={20} />
                          ) : (
                            <ChevronDown className="flex-shrink-0 text-muted-foreground" size={20} />
                          )}
                        </button>
                        
                        {expandedItems?.has(item?.id) && (
                          <div className="px-6 pb-4 border-t border-border bg-muted/20">
                            <p className="text-muted-foreground leading-relaxed pt-4">
                              {highlightText(item?.answer, searchQuery)}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No FAQs found</p>
                  <p className="text-sm">Try adjusting your search terms or category filter</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Contact Support Section */}
          <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Still need help?
            </h3>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="default" size="sm">
                Contact Support
              </Button>
              <Button variant="outline" size="sm">
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQPage;