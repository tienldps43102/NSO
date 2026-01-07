import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  content: string;
  helpful: number;
  images?: string[];
}

interface CustomerReviewsProps {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: { stars: number; count: number }[];
  reviews: Review[];
}

export function CustomerReviews({
  averageRating,
  totalReviews,
  ratingBreakdown,
  reviews,
}: CustomerReviewsProps) {
  return (
    <section id="reviews" className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Đánh giá từ khách hàng</h2>

      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-card rounded-2xl border border-border">
        {/* Overall Rating */}
        <div className="flex flex-col items-center justify-center gap-2 md:pr-8 md:border-r border-border">
          <span className="text-5xl font-bold text-foreground">{averageRating.toFixed(1)}</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-5 h-5",
                  i < Math.floor(averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted",
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{totalReviews} đánh giá</span>
        </div>

        {/* Rating Breakdown */}
        <div className="flex-1 space-y-2">
          {ratingBreakdown.map(({ stars, count }) => {
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-6">{stars}★</span>
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write Review Button */}
      <div className="flex justify-end">
        <Button className="gap-2">
          <MessageCircle className="w-4 h-4" />
          Viết đánh giá
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="p-5 bg-card rounded-xl border border-border space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {review.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{review.author}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted",
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">• {review.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>

            {/* Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {review.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Review image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-border"
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 h-8">
                <ThumbsUp className="w-4 h-4" />
                Hữu ích ({review.helpful})
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-2">
        <Button variant="outline">Xem thêm đánh giá</Button>
      </div>
    </section>
  );
}
