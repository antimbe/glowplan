import { Card, CardContent, Badge, Button, Link, Heading, Text, Box, Flex, Stack, MotionBox } from "@/components/ui";
import { MapPin, Star, Heart, Calendar } from "lucide-react";

interface ProviderCardProps {
  name: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  services: string[];
  imageUrl?: string;
}

export default function ProviderCard({
  name,
  location,
  rating,
  reviewCount,
  services,
  imageUrl,
}: ProviderCardProps) {
  return (
    <Card 
      variant="default" 
      padding="none" 
      hoverable 
      className="group overflow-hidden bg-white border border-gray-100 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_10px_30px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_1px_rgba(50,66,44,0.1),0_20px_40px_-5px_rgba(50,66,44,0.15)] transition-all duration-500"
    >
      {/* Image Container with Hover Effect */}
      <Box className="relative h-72 overflow-hidden">
        <MotionBox
          className="absolute inset-0 bg-gray-200 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          }}
        />
        <Box className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Wishlist Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-md text-gray-900 hover:text-red-500 hover:bg-white transition-all shadow-sm h-10 w-10 min-w-0 z-10"
        >
          <Heart size={18} strokeWidth={2.5} />
        </Button>


        {/* Quick Info Overlay */}
        <Box className="absolute bottom-4 left-4 right-4 z-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <Flex wrap="wrap" gap={2}>
            {services.slice(0, 3).map((service) => (
              <Badge key={service} variant="secondary" size="sm" className="bg-white/95 backdrop-blur-sm text-primary border-none shadow-md font-bold">
                <Text variant="small" as="span" className="font-bold">{service}</Text>
              </Badge>
            ))}
          </Flex>
        </Box>
      </Box>

      <CardContent className="p-6 space-y-4">
        <Stack space={2}>
          <Flex justify="between" align="start" gap={4}>
            <Heading level={3} variant="card" className="group-hover:text-primary transition-colors line-clamp-1 flex-1">
              {name}
            </Heading>
            {rating && (
              <Flex align="center" gap={1.5} className="bg-accent/10 px-2.5 py-1 rounded-lg flex-shrink-0">
                <Star size={14} className="text-accent fill-accent" />
                <Text variant="small" as="span" className="font-extrabold text-accent leading-none">{rating}</Text>
              </Flex>
            )}
          </Flex>
          
          <Flex align="center" gap={1.5}>
            <MapPin size={16} className="text-primary/40" />
            <Text variant="small" as="span" className="text-gray-500 font-semibold">{location}</Text>
            {reviewCount && (
              <Text variant="small" as="span" className="text-gray-400 font-medium ml-1">
                • {reviewCount} avis
              </Text>
            )}
          </Flex>
        </Stack>

        <Flex align="center" justify="between" gap={4} className="pt-4 border-t border-gray-100">
          <Flex direction="col">
            <Text variant="muted" className="text-[10px] uppercase tracking-widest font-bold">À partir de</Text>
            <Text variant="default" as="span" className="font-extrabold text-primary text-xl">25€</Text>
          </Flex>
          <Button 
            variant="primary" 
            size="md" 
            className="font-bold shadow-lg shadow-primary/20 group/btn"
            asChild
          >
            <Link href="#" className="flex items-center gap-2">
              <Calendar size={18} className="group-hover/btn:scale-110 transition-transform" />
              <Text variant="small" as="span" className="font-bold">Réserver</Text>
            </Link>
          </Button>
        </Flex>
      </CardContent>
    </Card>
  );
}
