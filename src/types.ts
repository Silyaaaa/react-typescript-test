export interface Product {
    id: number;
    title: string;
    description: string;
    image: string;
    liked: boolean;
  }
  
  export interface ProductState {
    products: Product[];
    isLoaded: boolean;
  }
  