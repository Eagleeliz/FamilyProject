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
  const [activeTab, setActiveTab] = useState<'people' | 'families'>('people');

  const { data: peopleData, isLoading: peopleLoading, isFetching: peopleFetching } = useQuery({
    queryKey: ['search', searchQuery, page],
    queryFn: () => personService.search(searchQuery, page, 20),
    enabled: activeTab === 'people' && searchQuery.length >= 2,
  });

  const { data: familiesData, isLoading: familiesLoading } = useQuery({
    queryKey: ['families', 'public'],
    queryFn: () => familyService.getPublic(),
    enabled: activeTab === 'families',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length >= 2) {
      setSearchQuery(query);
      setPage(1);
    }
  };

  const filteredFamilies = familiesData?.data?.filter(family =>
    family.name.toLowerCase().includes(query.toLowerCase())
  ) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-4">Search</h1>
        <p className="text-gray-600">
          Find family members or browse available families
        </p>
      </motion.div>

      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab('people')}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            activeTab === 'people'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Search People
        </button>
        <button
          onClick={() => setActiveTab('families')}
          className={`px-6 py-2 rounded-full font-medium transition-colors ${
            activeTab === 'families'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Browse Families
        </button>
      </div>

      {activeTab === 'families' ? (
        <div>
          <div className="mb-8">
            <Input
              type="text"
              placeholder="Search families by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-md mx-auto"
            />
          </div>

          {familiesLoading ? (
            <div className="text-center py-12 text-gray-500">Loading families...</div>
          ) : filteredFamilies.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFamilies.map((family, index) => (
                <motion.div
                  key={family.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2C6 2 2 6 2 10c0 4 4 10 8 8 4-2 8-4 8-8 0-4-4-8-8-8z" />
                        </svg>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{family.name}</h3>
                    {family.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{family.description}</p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{family.memberCount || 0} members</span>
                      {family.rootPerson && (
                        <span>Root: {family.rootPerson.firstName} {family.rootPerson.lastName}</span>
                      )}
                    </div>

                    <Link to={`/families/${family.id}/preview`}>
                      <Button className="w-full">View Family</Button>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="text-center py-12 text-gray-500">
              No families found matching "{query}"
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No families available yet
            </div>
          )}
        </div>
      ) : (
        <>
          <form onSubmit={handleSearch} className="mb-12">
            <div className="flex gap-4 max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Search by name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" isLoading={peopleFetching} disabled={query.length < 2}>
                Search
              </Button>
            </div>
          </form>

          {peopleLoading ? (
            <div className="text-center py-12 text-gray-500">Searching...</div>
          ) : peopleData?.data && peopleData.data.length > 0 ? (
            <>
              <div className="space-y-4 max-w-2xl mx-auto">
                {peopleData.data.map((person, index) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4">
                      <Link to={`/families/${person.familyId}/preview`} className="flex items-center gap-4">
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
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {peopleData.pagination && peopleData.pagination.totalPages > 1 && (
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
                    Page {page} of {peopleData.pagination.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === peopleData.pagination.totalPages}
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
        </>
      )}
    </div>
  );
}
