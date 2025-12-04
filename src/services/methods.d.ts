export interface Method {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  image_url?: string;
  created_at?: string;
  [key: string]: any;
}

export function createMethod(method: Partial<Method>): Promise<Method>;
export function listMethods(userId?: string): Promise<Method[]>;
