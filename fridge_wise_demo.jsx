import React, { useMemo, useState } from "react";
import { Camera, Leaf, Plus, Bell, Trash2, Pencil, ChefHat, CalendarDays, Sparkles, Apple, X, UploadCloud, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const today = new Date("2026-06-01T12:00:00");

type Product = {
  id: number;
  name: string;
  category: string;
  expiry: string;
  estimated: boolean;
  image: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  recipes: Recipe[];
};

type Recipe = {
  name: string;
  time: string;
  kcal: string;
  difficulty: string;
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Yogurt Greco",
    category: "Latticini",
    expiry: "2026-06-15",
    estimated: false,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800&auto=format&fit=crop",
    calories: "59 kcal",
    protein: "10 g",
    fat: "0.4 g",
    carbs: "3.6 g",
    recipes: [
      { name: "Bowl yogurt, banana e avena", time: "8 min", kcal: "310 kcal", difficulty: "Facile" },
      { name: "Salsa yogurt alle erbe", time: "5 min", kcal: "120 kcal", difficulty: "Facile" },
      { name: "Smoothie proteico", time: "6 min", kcal: "240 kcal", difficulty: "Facile" }
    ]
  },
  {
    id: 2,
    name: "Latte Parzialmente Scremato",
    category: "Latticini",
    expiry: "2026-06-10",
    estimated: false,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=800&auto=format&fit=crop",
    calories: "46 kcal",
    protein: "3.4 g",
    fat: "1.5 g",
    carbs: "4.8 g",
    recipes: [
      { name: "Porridge leggero", time: "10 min", kcal: "280 kcal", difficulty: "Facile" },
      { name: "Pancake proteici", time: "15 min", kcal: "390 kcal", difficulty: "Media" }
    ]
  },
  {
    id: 3,
    name: "Spinaci Freschi",
    category: "Verdura",
    expiry: "2026-06-03",
    estimated: true,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=800&auto=format&fit=crop",
    calories: "23 kcal",
    protein: "2.9 g",
    fat: "0.4 g",
    carbs: "3.6 g",
    recipes: [
      { name: "Frittata light agli spinaci", time: "18 min", kcal: "330 kcal", difficulty: "Facile" },
      { name: "Insalata proteica verde", time: "12 min", kcal: "260 kcal", difficulty: "Facile" },
      { name: "Pasta integrale con spinaci", time: "20 min", kcal: "430 kcal", difficulty: "Media" }
    ]
  },
  {
    id: 4,
    name: "Banana",
    category: "Frutta",
    expiry: "2026-06-04",
    estimated: true,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=800&auto=format&fit=crop",
    calories: "89 kcal",
    protein: "1.1 g",
    fat: "0.3 g",
    carbs: "23 g",
    recipes: [
      { name: "Smoothie banana e yogurt", time: "5 min", kcal: "250 kcal", difficulty: "Facile" },
      { name: "Banana bread fit", time: "45 min", kcal: "210 kcal", difficulty: "Media" }
    ]
  },
  {
    id: 5,
    name: "Pomodori",
    category: "Verdura",
    expiry: "2026-06-06",
    estimated: true,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=800&auto=format&fit=crop",
    calories: "18 kcal",
    protein: "0.9 g",
    fat: "0.2 g",
    carbs: "3.9 g",
    recipes: [
      { name: "Insalata mediterranea", time: "10 min", kcal: "220 kcal", difficulty: "Facile" },
      { name: "Bruschette integrali", time: "12 min", kcal: "260 kcal", difficulty: "Facile" }
    ]
  }
];

function daysLeft(date: string) {
  const expiry = new Date(`${date}T12:00:00`);
  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function statusFor(days: number) {
  if (days <= 3) return { label: "Urgente", className: "bg-red-100 text-red-700 border-red-200" };
  if (days <= 7) return { label: "Attenzione", className: "bg-orange-100 text-orange-700 border-orange-200" };
  return { label: "Ok", className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
}

function addDays(days: number) {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function FridgeWiseDemo() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAlert, setShowAlert] = useState(true);
  const [mealPlan, setMealPlan] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const expiringSoon = useMemo(() => {
    return products
      .filter((product) => daysLeft(product.expiry) <= 3)
      .sort((a, b) => daysLeft(a.expiry) - daysLeft(b.expiry));
  }, [products]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      urgent: expiringSoon.length,
      saved: "2.4 kg",
      recipes: products.reduce((sum, product) => sum + product.recipes.length, 0)
    };
  }, [products, expiringSoon.length]);

  function simulateScan() {
    setIsScanning(true);
    setTimeout(() => {
      const newProduct: Product = {
        id: Date.now(),
        name: "Mozzarella Light",
        category: "Latticini",
        expiry: addDays(5),
        estimated: false,
        image: previewImage || "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=800&auto=format&fit=crop",
        calories: "157 kcal",
        protein: "19 g",
        fat: "8.5 g",
        carbs: "1 g",
        recipes: [
          { name: "Caprese leggera", time: "8 min", kcal: "290 kcal", difficulty: "Facile" },
          { name: "Toast integrale mozzarella e pomodoro", time: "12 min", kcal: "360 kcal", difficulty: "Facile" },
          { name: "Insalata proteica", time: "10 min", kcal: "310 kcal", difficulty: "Facile" }
        ]
      };
      setProducts((current) => [newProduct, ...current]);
      setIsScanning(false);
      setPreviewImage(null);
      setIsOpen(false);
    }, 1400);
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  function removeProduct(id: number) {
    setProducts((current) => current.filter((product) => product.id !== id));
    if (selectedProduct?.id === id) setSelectedProduct(null);
  }

  function generateMealPlan() {
    const urgentNames = expiringSoon.map((product) => product.name).join(", ") || "i prodotti disponibili";
    setMealPlan([
      `Colazione: bowl con Yogurt Greco, Banana e avena per usare prima gli alimenti più maturi.`,
      `Pranzo: insalata proteica con Spinaci Freschi, Pomodori e Mozzarella Light.`,
      `Cena: frittata light con Spinaci Freschi e contorno di pomodori. Priorità a: ${urgentNames}.`
    ]);
  }

  return (
    <div className="min-h-screen bg-[#F5F8F2] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-5 rounded-[2rem] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DCEFD8]">
              <Leaf className="h-8 w-8 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">FridgeWise AI</h1>
              <p className="text-slate-500">Riduci gli sprechi alimentari e consuma i tuoi prodotti in tempo.</p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-emerald-700 px-5 py-6 text-white hover:bg-emerald-800">
                <Plus className="mr-2 h-5 w-5" /> Aggiungi prodotto
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl sm:max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Carica una foto del prodotto</DialogTitle>
              </DialogHeader>

              <div className="space-y-5">
                <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50 p-6 text-center transition hover:bg-emerald-100">
                  {previewImage ? (
                    <img src={previewImage} alt="Anteprima prodotto" className="h-56 w-full rounded-2xl object-cover" />
                  ) : (
                    <>
                      <UploadCloud className="mb-4 h-12 w-12 text-emerald-700" />
                      <p className="text-lg font-semibold">Trascina o seleziona immagine</p>
                      <p className="text-sm text-slate-500">La demo simula riconoscimento prodotto, scadenza e valori nutrizionali.</p>
                    </>
                  )}
                  <Input type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </label>

                {isScanning ? (
                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                      <Sparkles className="h-5 w-5 animate-pulse text-emerald-700" />
                      <span className="font-semibold">Analisi prodotto in corso...</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-emerald-100">
                      <div className="h-full w-2/3 animate-pulse rounded-full bg-emerald-600" />
                    </div>
                  </div>
                ) : (
                  <Button onClick={simulateScan} className="w-full rounded-2xl bg-emerald-700 py-6 text-white hover:bg-emerald-800">
                    <Camera className="mr-2 h-5 w-5" /> Simula scansione AI
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {showAlert && expiringSoon.length > 0 && (
          <div className="fixed right-6 top-6 z-50 w-[360px] rounded-3xl border border-orange-200 bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-700" />
                </div>
                <div>
                  <h3 className="font-bold">Attenzione</h3>
                  <p className="text-sm text-slate-500">Prodotti da consumare entro 3 giorni.</p>
                </div>
              </div>
              <button onClick={() => setShowAlert(false)} className="rounded-full p-1 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {expiringSoon.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl bg-orange-50 px-3 py-2 text-sm">
                  <span>{product.name}</span>
                  <span className="font-semibold text-orange-700">{daysLeft(product.expiry)} giorni</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard icon={<Apple />} label="Prodotti totali" value={stats.total} />
          <StatCard icon={<Bell />} label="In scadenza" value={stats.urgent} />
          <StatCard icon={<Leaf />} label="Spreco evitato" value={stats.saved} />
          <StatCard icon={<ChefHat />} label="Ricette disponibili" value={stats.recipes} />
        </section>

        <main className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Il tuo frigorifero</h2>
                  <p className="text-slate-500">Tutti gli alimenti monitorati dalla demo.</p>
                </div>
                <Badge className="rounded-full bg-[#DCEFD8] px-4 py-2 text-emerald-800 hover:bg-[#DCEFD8]">Green mode</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {products.map((product) => {
                  const days = daysLeft(product.expiry);
                  const status = statusFor(days);

                  return (
                    <Card key={product.id} className="overflow-hidden rounded-3xl border-0 bg-[#FAFCF8] shadow-sm transition hover:shadow-md">
                      <img src={product.image} alt={product.name} className="h-40 w-full object-cover" />
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold">{product.name}</h3>
                            <p className="text-sm text-slate-500">{product.category}</p>
                          </div>
                          <Badge className={`rounded-full border ${status.className}`}>{status.label}</Badge>
                        </div>

                        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                          <Info label="Scadenza" value={formatDate(product.expiry)} />
                          <Info label="Giorni rimasti" value={`${days} giorni`} />
                        </div>

                        {product.estimated && <Badge className="mb-4 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100">Scadenza stimata</Badge>}

                        <div className="flex gap-2">
                          <Button onClick={() => setSelectedProduct(product)} variant="outline" className="flex-1 rounded-2xl">
                            Dettagli
                          </Button>
                          <Button variant="outline" className="rounded-2xl px-3">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => removeProduct(product.id)} variant="outline" className="rounded-2xl px-3 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-2xl font-bold">Da consumare subito</h2>
              <p className="mb-5 text-slate-500">Priorità agli alimenti entro 3 giorni.</p>
              <div className="space-y-3">
                {expiringSoon.map((product) => (
                  <button key={product.id} onClick={() => setSelectedProduct(product)} className="flex w-full items-center gap-3 rounded-3xl bg-red-50 p-3 text-left transition hover:bg-red-100">
                    <img src={product.image} alt={product.name} className="h-14 w-14 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-red-700">Scade tra {daysLeft(product.expiry)} giorni</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DCEFD8]">
                  <Sparkles className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Meal Planner AI</h2>
                  <p className="text-sm text-slate-500">Genera pasti anti spreco.</p>
                </div>
              </div>
              <Button onClick={generateMealPlan} className="mb-4 w-full rounded-2xl bg-emerald-700 py-6 text-white hover:bg-emerald-800">
                Genera pasti
              </Button>
              <div className="space-y-3">
                {mealPlan.map((meal, index) => (
                  <div key={index} className="rounded-2xl bg-[#F5F8F2] p-4 text-sm leading-relaxed text-slate-700">
                    {meal}
                  </div>
                ))}
              </div>
            </div>

            <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
          </aside>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card className="rounded-3xl border-0 bg-white shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCEFD8] text-emerald-700">
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function ProductDetail({ product, onClose }: { product: Product | null; onClose: () => void }) {
  if (!product) {
    return (
      <div className="rounded-[2rem] bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold">Dettaglio prodotto</h2>
        <p className="text-slate-500">Seleziona un alimento per vedere valori nutrizionali e ricette salutari.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <p className="text-slate-500">{product.category}</p>
        </div>
        <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
          <X className="h-4 w-4" />
        </button>
      </div>

      <img src={product.image} alt={product.name} className="mb-5 h-44 w-full rounded-3xl object-cover" />

      <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
        <Info label="Scadenza" value={formatDate(product.expiry)} />
        <Info label="Giorni rimasti" value={`${daysLeft(product.expiry)} giorni`} />
        <Info label="Calorie" value={product.calories} />
        <Info label="Proteine" value={product.protein} />
        <Info label="Grassi" value={product.fat} />
        <Info label="Carboidrati" value={product.carbs} />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <ChefHat className="h-5 w-5 text-emerald-700" />
        <h3 className="font-bold">Ricette consigliate</h3>
      </div>

      <div className="space-y-3">
        {product.recipes.map((recipe) => (
          <div key={recipe.name} className="rounded-2xl bg-[#F5F8F2] p-4">
            <p className="font-semibold">{recipe.name}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
              <Badge variant="outline" className="rounded-full bg-white"><CalendarDays className="mr-1 h-3 w-3" />{recipe.time}</Badge>
              <Badge variant="outline" className="rounded-full bg-white">{recipe.kcal}</Badge>
              <Badge variant="outline" className="rounded-full bg-white">{recipe.difficulty}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
