"use client";

import { useState } from "react";
import { Star, ThumbsUp, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  helpful?: number;
  images?: string[];
}

interface Shipping {
  freeShipping: boolean;
  estimatedDays: number;
  returnPolicy?: string;
}

interface ProductTabsProps {
  description: string;
  reviews: Review[];
  shipping?: Shipping;
  reviewCount: number;
  rating: number;
  features?: Array<{ icon: string; title: string; description: string }>;
  brandStory?: string;
  guarantee?: string;
  specifications?: Record<string, string>;
}

export function ProductTabs({
  description,
  reviews,
  shipping,
  reviewCount,
  rating,
  features,
  brandStory,
  guarantee,
  specifications,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "description" | "reviews" | "shipping"
  >("description");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const faqs = [
    {
      question: "What's included in the box?",
      answer:
        "The package includes the headphones, carrying case, USB-C charging cable, audio cable (3.5mm), and quick start guide.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping takes 3-5 business days. Express shipping (1-2 days) is available at checkout for an additional fee.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy. Items must be unused and in original packaging. Return shipping is free for defective items.",
    },
    {
      question: "Is the warranty transferable?",
      answer:
        "The manufacturer warranty is non-transferable and only valid for the original purchaser with proof of purchase.",
    },
    {
      question: "Can I use these headphones while charging?",
      answer:
        "Yes, you can use the headphones in wired mode with the included audio cable while they're charging.",
    },
  ];

  const reviewSentiment =
    reviews && reviews.length > 0
      ? {
          positive: Math.round(
            (reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100
          ),
          comfort: 92,
          quality: 95,
          value: 88,
        }
      : null;

  const toggleHelpful = (reviewId: string) => {
    setHelpfulReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-4 sm:gap-8 min-w-max">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-2 text-xs font-medium transition-colors whitespace-nowrap sm:pb-3 sm:text-sm ${
              activeTab === "description"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            Description
          </button>
          {reviews && reviews.length > 0 && (
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2 text-xs font-medium transition-colors whitespace-nowrap sm:pb-3 sm:text-sm ${
                activeTab === "reviews"
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              Reviews ({reviewCount})
            </button>
          )}
          {shipping && (
            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-2 text-xs font-medium transition-colors whitespace-nowrap sm:pb-3 sm:text-sm ${
                activeTab === "shipping"
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              Shipping & Returns
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6 sm:py-8">
        {activeTab === "description" && (
          <div className="space-y-6 sm:space-y-8">
            {features && features.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
                  Why You'll Love It
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="border border-border bg-card p-3 sm:p-4">
                      <h4 className="mb-1 text-sm font-semibold text-foreground text-pretty">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-muted-foreground text-pretty">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {description && (
              <div className="prose prose-sm max-w-none">
                <div
                  className="whitespace-pre-line text-sm leading-relaxed text-foreground text-pretty"
                  dangerouslySetInnerHTML={{
                    __html: description,
                  }}></div>
              </div>
            )}

            {specifications && Object.keys(specifications).length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
                  Full Specifications
                </h3>
                <div className="overflow-x-auto">
                  <div className="min-w-full border border-border">
                    {Object.entries(specifications).map(
                      ([key, value], index) => (
                        <div
                          key={key}
                          className={`flex justify-between p-2.5 text-xs sm:p-3 ${
                            index % 2 === 0 ? "bg-muted/30" : ""
                          }`}>
                          <span className="font-medium text-foreground text-pretty">
                            {key}
                          </span>
                          <span className="text-muted-foreground text-right text-pretty">
                            {value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {brandStory && (
              <div className="border-t border-border pt-8">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Our Story
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {brandStory}
                </p>
              </div>
            )}

            {guarantee && (
              <div className="border border-foreground bg-card p-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Our Guarantee
                </h3>
                <p className="text-xs text-muted-foreground">{guarantee}</p>
              </div>
            )}

            <div className="border-t border-border pt-6 sm:pt-8">
              <h3 className="mb-3 text-sm font-semibold text-foreground sm:mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-border">
                    <button
                      onClick={() =>
                        setOpenFaq(openFaq === index ? null : index)
                      }
                      className="flex w-full items-center justify-between p-2.5 text-left text-xs font-medium text-foreground hover:bg-muted/30 sm:p-3 sm:text-sm">
                      <span className="pr-2 text-pretty">{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="border-t border-border p-2.5 sm:p-3">
                        <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && reviews && reviews.length > 0 && (
          <div>
            {/* Reviews Summary */}
            <div className="mb-6 flex flex-col gap-6 border-b border-border pb-6 sm:mb-8 sm:flex-row sm:items-start sm:gap-8 sm:pb-8">
              <div className="text-center sm:text-left">
                <div className="mb-2 text-3xl font-semibold text-foreground sm:text-4xl">
                  {rating}
                </div>
                <div className="mb-2 flex justify-center gap-0.5 sm:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                        i < Math.floor(rating)
                          ? "fill-foreground text-foreground"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {reviewCount} reviews
                </div>
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const percentage = Math.floor(Math.random() * 60) + 20;
                    return (
                      <div
                        key={stars}
                        className="flex items-center gap-2 sm:gap-3">
                        <span className="w-12 text-xs text-muted-foreground whitespace-nowrap">
                          {stars} star
                        </span>
                        <div className="h-2 flex-1 bg-muted">
                          <div
                            className="h-full bg-foreground"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-10 text-xs text-muted-foreground text-right">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {reviewSentiment && (
              <div className="mb-6 border border-border bg-card p-3 sm:mb-8 sm:p-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground sm:mb-3">
                  Customer Insights
                </h3>
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground sm:mb-4 text-pretty">
                  {reviewSentiment.positive}% of customers loved this product.
                  Most praised the comfort, sound quality, and battery life.
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <div className="mb-1 text-base font-semibold text-foreground sm:text-lg">
                      {reviewSentiment.comfort}%
                    </div>
                    <div className="text-xs text-muted-foreground">Comfort</div>
                  </div>
                  <div>
                    <div className="mb-1 text-base font-semibold text-foreground sm:text-lg">
                      {reviewSentiment.quality}%
                    </div>
                    <div className="text-xs text-muted-foreground">Quality</div>
                  </div>
                  <div>
                    <div className="mb-1 text-base font-semibold text-foreground sm:text-lg">
                      {reviewSentiment.value}%
                    </div>
                    <div className="text-xs text-muted-foreground">Value</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4 sm:mb-6">
              <Link href="/account">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent text-xs sm:text-sm">
                  <Edit className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Write a Review
                </Button>
              </Link>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4 sm:space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-border pb-4 last:border-0 sm:pb-6">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                            i < review.rating
                              ? "fill-foreground text-foreground"
                              : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                    {review.verified && (
                      <span className="border border-foreground px-1.5 py-0.5 text-xs font-medium text-foreground">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-foreground text-pretty">
                    {review.title}
                  </h4>
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{review.author}</span>
                    <span>•</span>
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-foreground text-pretty">
                    {review.content}
                  </p>

                  {review.images && review.images.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {review.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative h-16 w-16 shrink-0 overflow-hidden border border-border sm:h-20 sm:w-20">
                          <Image
                            src={img || "/placeholder.svg"}
                            alt={`Review image ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHelpful(review.id)}
                    className={`text-xs ${
                      helpfulReviews.has(review.id)
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}>
                    <ThumbsUp className="mr-1.5 h-3 w-3" />
                    Helpful (
                    {(review.helpful || 0) +
                      (helpfulReviews.has(review.id) ? 1 : 0)}
                    )
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "shipping" && shipping && (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Shipping Information
              </h3>
              <p className="mb-1 text-sm text-foreground text-pretty">
                {shipping.freeShipping
                  ? "Free shipping on all orders over $50"
                  : "Standard shipping rates apply"}
              </p>
              {shipping.estimatedDays && (
                <p className="text-sm text-muted-foreground text-pretty">
                  Estimated delivery: {shipping.estimatedDays}
                </p>
              )}
            </div>
            {shipping.returnPolicy && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Return Policy
                </h3>
                <p className="text-sm text-foreground text-pretty">
                  {shipping.returnPolicy}
                </p>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">
                  Items must be unused and in original packaging. Return
                  shipping costs may apply.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
