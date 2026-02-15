export interface EstablishmentSearchResult {
    id: string;
    name: string;
    city: string;
    activity_sectors: string[];
    main_photo_url: string | null;
    description: string | null;
    min_price: number | null;
    average_rating: number | null;
    review_count: number;
}
