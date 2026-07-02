import Card from '../../components/Card';

const faqs = [
  ['Est-ce que le paiement est en ligne ?', 'Non. Le paiement est confirme manuellement hors plateforme.'],
  ['Quand mon acces est-il active ?', 'Apres validation par l administration et association de votre pack.'],
  ['Les PDF sont-ils publics ?', 'Non. Les fichiers sont stockes dans un bucket prive et servis via liens temporaires.'],
  ['Les videos YouTube sont-elles publiques ?', 'Non. Les liens non repertories sont visibles uniquement dans l espace etudiant.'],
];

export default function FAQ() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-navy">FAQ</h1>
      <div className="mt-6 grid gap-4">
        {faqs.map(([question, answer]) => (
          <Card key={question} className="p-5">
            <h2 className="font-black text-navy">{question}</h2>
            <p className="mt-2 text-slate-600">{answer}</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
