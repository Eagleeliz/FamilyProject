import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { personService } from '@/services/person.service';
import { familyService } from '@/services/family.service';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { getInitials } from '@/utils/helpers';

export default function Search() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data: families } = useQuery({
    queryKey: ['families'],
    queryFn: familyService.getAll,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', searchQuery, page],
    queryFn: () => personService.search(searchQuery, page, 20),
    enabled: searchQuery.length >= 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length >= 2) {
      setSearchQuery(query);
      setPage(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Search People</h1>
        <p className="text-gray-600">Search across all families in the system</p>
      </motion.div>

      <form onSubmit={handleSearch} className="mb-12">
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" isLoading={isFetching} disabled={query.length < 2}>
            Search
          </Button>
        </div>
      </form>

      {families?.data && families.data.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Your Families</h2>
          <div className="flex flex-wrap gap-2">
            {families.data.map((family) => (
              <Link
                key={family.id}
                to={`/dashboard/family/${family.id}`}
                className="px-3 py-1 bg-surface rounded-full text-sm hover:bg-primary-light transition-colors"
              >
                {family.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Searching...</div>
      ) : data?.data && data.data.length > 0 ? (
        <>
          <div className="space-y-4">
            {data.data.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    {person.profileImageUrl ? (
                      <img
                        src={person.profileImageUrl}
                        alt={`${person.firstName} ${person.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary font-semibold">
                        {getInitials(person.firstName, person.lastName)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {person.firstName} {person.lastName}
                      </h3>
                      {person.familyName && (
                        <p className="text-sm text-gray-500">{person.familyName} Family</p>
                      )}
                    </div>
                    <Link
                      to={`/dashboard/person/${person.id}/relatives`}
                      className="text-sm text-primary hover:underline"
                    >
                      View Relatives
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : searchQuery.length >= 2 ? (
        <div className="text-center py-12 text-gray-500">
          No results found for "{searchQuery}"
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          Enter at least 2 characters to search
        </div>
      )}
    </div>
  );
}
