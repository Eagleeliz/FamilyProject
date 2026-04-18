import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center">About Lineage</h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">What is Lineage?</h2>
            <p className="text-gray-600 mb-4">
              Lineage is a modern family tree and genealogy tracking platform designed to help
              you document, explore, and preserve your family's history. Unlike traditional
              genealogy tools, Lineage treats family relationships as a dynamic graph, allowing
              for complex relationship tracking and discovery.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="bg-surface p-6 rounded-xl">
                <h3 className="font-semibold mb-2">1. Create Your Family</h3>
                <p className="text-gray-600">
                  Start by creating a family tree and adding the root ancestor. Each family
                  serves as a container for grouping related individuals.
                </p>
              </div>

              <div className="bg-surface p-6 rounded-xl">
                <h3 className="font-semibold mb-2">2. Add Family Members</h3>
                <p className="text-gray-600">
                  Add people to your tree with their details like birth date, name, and photo.
                  Members can be added with pending approval for quality control.
                </p>
              </div>

              <div className="bg-surface p-6 rounded-xl">
                <h3 className="font-semibold mb-2">3. Define Relationships</h3>
                <p className="text-gray-600">
                  Connect family members with relationships: parent, child, sibling, or spouse.
                  The system automatically maintains relationship consistency.
                </p>
              </div>

              <div className="bg-surface p-6 rounded-xl">
                <h3 className="font-semibold mb-2">4. Explore & Discover</h3>
                <p className="text-gray-600">
                  Visualize your family tree as an interactive graph. Discover relatives,
                  view cousins across generations, and search the entire system.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Graph-based family tree visualization</li>
              <li>Dynamic cousin calculation across generations</li>
              <li>Relationship validation to prevent errors</li>
              <li>Public search for finding relatives</li>
              <li>Profile images with Cloudinary storage</li>
              <li>Role-based access for families</li>
              <li>Admin moderation for quality control</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
            <p className="text-gray-600 mb-4">
              Built with modern web technologies for performance and scalability:
            </p>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Vite', 'Node.js', 'Express', 'PostgreSQL', 'Cloudinary', 'Framer Motion'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
