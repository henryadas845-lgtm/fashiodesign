export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  availability: boolean;
  featured: boolean;
  images: string[];
  createdAt: string;
}

export interface ContentData {
  hero: {
    headline: string;
    subheading: string;
  };
  about: {
    text: string;
  };
  vision: {
    text: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    hours: string;
  };
}
