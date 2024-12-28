import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../services/api';
import { Book } from '../types/book';

export const useBooks = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const { data: books, isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      const response = await api.get<{ books: Book[] }>('/books/collection', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.books;
    },
  });

  const invalidateBooks = () => {
    queryClient.invalidateQueries({ queryKey: ['books'] });
  };

  return { books, isLoading, error, invalidateBooks };
}; 