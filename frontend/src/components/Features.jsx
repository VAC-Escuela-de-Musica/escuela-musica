export default function Features() {
  return (
    <section className="py-16 px-4 bg-gray-100">
      <h2 className="text-3xl font-semibold mb-8 text-center">Lo que ofrecemos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded shadow">Feature 1</div>
        <div className="bg-white p-6 rounded shadow">Feature 2</div>
        <div className="bg-white p-6 rounded shadow">Feature 3</div>
      </div>
    </section>
  );
}
