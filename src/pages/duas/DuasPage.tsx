import { duasApi } from "@/api/duas.api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useAuth } from "@/hooks/useAuth";
import type { Dua, DuaCategory, DuaStats } from "@/lib/types/duas";
import {
  BarChart3,
  BookOpen,
  Edit,
  Eye,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useConfirm } from "@/components/ui/Confirm";

export default function DuasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { confirm, ConfirmDialog } = useConfirm();
  const [duas, setDuas] = useState<Dua[]>([]);
  const [categories, setCategories] = useState<DuaCategory[]>([]);
  const [stats, setStats] = useState<DuaStats>({ total: 0, important: 0, byCategory: {} });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
  const [importantFilter, setImportantFilter] = useState(searchParams.get("important") === "true");


  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [duasData, categoriesData, statsData] = await Promise.all([
          duasApi.getAll({
            category: categoryFilter !== "all" ? categoryFilter : undefined,
            search: searchQuery || undefined,
            isImportant: importantFilter || undefined,
            limit: 20,
          }),
          duasApi.getCategories(),
          duasApi.getStats(),
        ]);

        setDuas(duasData);
        setCategories(categoriesData);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading duas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, categoryFilter, searchQuery, importantFilter]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (importantFilter) params.set("important", "true");
    setSearchParams(params);
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);

    if (key === "category") {
      setCategoryFilter(value as string);
      if (value !== "all") params.set("category", value as string);
    } else if (key === "important") {
      setImportantFilter(value as boolean);
      if (value) params.set("important", "true");
    }

    if (categoryFilter !== "all" && key !== "category") params.set("category", categoryFilter);
    if (importantFilter && key !== "important") params.set("important", "true");

    setSearchParams(params);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Dua',
      description: 'Are you sure you want to delete this dua? This action cannot be undone.',
      confirmText: 'Delete',
      confirmVariant: 'destructive',
      icon: 'warning'
    });
    if (confirmed) {
      await duasApi.delete(id);
      setDuas(duas.filter((d) => d.id !== id));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Duas Management</h1>
          <p className="text-muted-foreground">Manage Islamic duas and supplications</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/duas/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Dua
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Duas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Important Duas</p>
                <p className="text-2xl font-bold">{stats.important}</p>
              </div>
              <Star className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger className="cursor-pointer" value="all">
            All Duas
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="categories">
            Categories
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="stats">
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search duas..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name_bn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={importantFilter ? "default" : "outline"}
                  onClick={() => handleFilterChange("important", !importantFilter)}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Important Only
                </Button>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {duas.map((dua) => (
              <Card key={dua.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{dua.title_bn}</h3>
                        {dua.is_important && (
                          <Badge variant="secondary" className="shrink-0">
                            <Star className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      {dua.title_en && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{dua.title_en}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 rounded-lg border">
                    <p className="text-right arabic-text text-lg leading-relaxed line-clamp-3">
                      {dua.dua_text_ar}
                    </p>
                  </div>

                  {dua.translation_bn && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">বাংলা অনুবাদ</p>
                      <p className="text-sm line-clamp-2">{dua.translation_bn}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {dua.category}
                      </Badge>
                      {dua.tags && dua.tags.length > 0 && (
                        <span className="text-xs text-muted-foreground">+{dua.tags.length} tags</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/duas/${dua.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/duas/${dua.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(dua.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {duas.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="mb-4 h-16 w-16 text-muted-foreground" />
                <p className="mb-2 text-lg font-semibold">No duas found</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Try adjusting your filters or add a new dua
                </p>
                <Button asChild>
                  <Link to="/duas/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Dua
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                      style={{ backgroundColor: category.color + "20" }}
                    >
                      {category.icon || "📿"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{category.name_bn}</h3>
                      {category.name_en && (
                        <p className="text-sm text-muted-foreground">{category.name_en}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {stats.byCategory[category.id] || 0} duas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Category Distribution</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byCategory).map(([categoryId, count]) => {
                    const category = categories.find((c) => c.id === categoryId);
                    const percentage = Math.round((count / stats.total) * 100);
                    return (
                      <div key={categoryId} className="flex items-center gap-3">
                        <span className="text-lg">{category?.icon || "📿"}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span>{category?.name_bn || categoryId}</span>
                            <span>
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: category?.color || "#10b981",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog />
    </div>
  );
}
