import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Calendar, Tag, FileText } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { UrgentBadge } from '@/components/UrgentBadge';
import { useRequests } from '@/contexts/RequestContext';
import { SERVICE_CATEGORIES } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConsultarStatus() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getRequestsByPnr, isLoading } = useRequests();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('pnr') || '');
  const [hasSearched, setHasSearched] = useState(false);

  const requests = hasSearched ? getRequestsByPnr(searchTerm) : [];

  useEffect(() => {
    if (searchParams.get('pnr')) {
      setHasSearched(true);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setHasSearched(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-2xl">
          <Card className="card-military mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-heading flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Consultar Status
              </CardTitle>
              <CardDescription>
                Digite o número da sua PNR para ver o status das solicitações.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="pnr" className="sr-only">Número da PNR</Label>
                  <Input
                    id="pnr"
                    placeholder="Ex: PNR-001"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="input-military"
                  />
                </div>
                <Button type="submit">Buscar</Button>
              </form>
            </CardContent>
          </Card>

          {isLoading && hasSearched && (
            <Card className="card-military">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Carregando solicitações...</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && hasSearched && (
            <>
              {requests.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">
                    Solicitações de {searchTerm.toUpperCase()}
                  </h2>
                  {requests.map(request => (
                    <Card key={request.id} className="card-military">
                      <CardContent className="py-4">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge status={request.status} />
                            {request.isUrgent && <UrgentBadge />}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            #{request.id.slice(0, 8)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {SERVICE_CATEGORIES[request.category]}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(request.createdAt, "dd 'de' MMMM 'de' yyyy", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>

                          <div className="flex items-start gap-2 text-sm">
                            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <p className="text-muted-foreground">{request.description}</p>
                          </div>

                          {request.status === 'negado' && request.denialReason && (
                            <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded text-sm">
                              <p className="font-medium text-destructive">Motivo da negativa:</p>
                              <p className="text-muted-foreground">{request.denialReason}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="card-military">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">
                      Nenhuma solicitação encontrada para <strong>{searchTerm}</strong>.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <div className="mt-6">
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              Voltar ao Início
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
