import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { personService } from '@/services/person.service';
import { relationshipService } from '@/services/relationship.service';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { getInitials, formatDate, getRelationshipLabel } from '@/utils/helpers';
import type { Person } from '@/types';

export default function Relatives() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: person, isLoading: personLoading } = useQuery({
    queryKey: ['person', id],
    queryFn: () => personService.getById(id!),
    enabled: !!id,
  });

  const { data: relativesData, isLoading: relativesLoading } = useQuery({
    queryKey: ['relatives', id],
    queryFn: () => relationshipService.getRelatives(id!),
    enabled: !!id,
  });

  const { data: cousinsData } = useQuery({
    queryKey: ['cousins', id],
    queryFn: () => relationshipService.getCousins(id!),
    enabled: !!id,
  });

  if (personLoading || relativesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!person?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Person Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const renderPersonCard = (p: Person, type: string) => (
    <Card key={p.id} className="p-4">
      <Link to={`/dashboard/person/${p.id}/relatives`} className="flex items-center gap-3">
        {p.profileImageUrl ? (
          <img
            src={p.profileImageUrl}
            alt={`${p.firstName} ${p.lastName}`}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-primary font-semibold text-sm">
            {getInitials(p.firstName, p.lastName)}
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-medium">
            {p.firstName} {p.lastName}
          </h4>
          {p.dateOfBirth && (
            <p className="text-xs text-gray-500">Born: {formatDate(p.dateOfBirth)}</p>
          )}
        </div>
        <span className="text-xs text-gray-400">{type}</span>
      </Link>
    </Card>
  );

  const relativeCategories = [
    { key: 'parents', label: 'Parents', data: relativesData?.data?.parents },
    { key: 'children', label: 'Children', data: relativesData?.data?.children },
    { key: 'siblings', label: 'Siblings', data: relativesData?.data?.siblings },
    { key: 'spouses', label: 'Spouses', data: relativesData?.data?.spouses },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Back
        </button>

        <Card className="p-8 mb-8">
          <div className="flex items-center gap-6">
            {person.data.profileImageUrl ? (
              <img
                src={person.data.profileImageUrl}
                alt={`${person.data.firstName} ${person.data.lastName}`}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center text-3xl font-bold text-primary">
                {getInitials(person.data.firstName, person.data.lastName)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">
                {person.data.firstName} {person.data.lastName}
              </h1>
              <div className="text-gray-600 mt-2">
                {person.data.dateOfBirth && (
                  <p>Born: {formatDate(person.data.dateOfBirth)}</p>
                )}
                {person.data.dateOfDeath && (
                  <p>Died: {formatDate(person.data.dateOfDeath)}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          {relativeCategories.map(({ key, label, data }) => (
            data && data.length > 0 && (
              <div key={key}>
                <h2 className="text-xl font-semibold mb-4">{label}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {data.map((p) => renderPersonCard(p, getRelationshipLabel(key.slice(0, -1))))}
                </div>
              </div>
            )
          ))}

          {cousinsData?.data && cousinsData.data.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Cousins</h2>
              <div className="space-y-4">
                {cousinsData.data.map((cousinGroup) => (
                  <div key={cousinGroup.degree}>
                    <h3 className="text-lg font-medium mb-2">
                      {cousinGroup.degree === 1 ? 'First' : cousinGroup.degree === 2 ? 'Second' : `${cousinGroup.degree}th`} Cousins
                    </h3>
                    {cousinGroup.cousins.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {cousinGroup.cousins.map((p) => renderPersonCard(p, 'Cousin'))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No {cousinGroup.degree === 1 ? 'first' : `${cousinGroup.degree}th`} cousins found</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
