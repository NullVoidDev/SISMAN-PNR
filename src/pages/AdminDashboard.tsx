import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Eye, CheckCircle, XCircle, FileText, AlertTriangle, Home, Archive, Trash2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { UrgentBadge } from '@/components/UrgentBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useRequests } from '@/contexts/RequestContext';
import { MaintenanceRequest, SERVICE_CATEGORIES, ServiceCategory, RequestStatus, STATUS_LABELS } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { requests, updateRequestStatus, toggleUrgent, archiveRequest, deleteRequest, isLoading: requestsLoading } = useRequests();
  const { toast } = useToast();

  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<ServiceCategory | 'all'>('all');
  const [filterUrgent, setFilterUrgent] = useState<'all' | 'urgent' | 'normal'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [searchPnr, setSearchPnr] = useState('');

  // Aplicar debounce na busca para evitar filtros a cada tecla
  const debouncedSearchPnr = useDebounce(searchPnr, 300);

  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [denialReason, setDenialReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Loading state
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </main>
      </div>
    );
  }

  // Filter requests
  const filteredRequests = requests.filter(request => {
    // Filter archived
    if (!showArchived && request.isArchived) return false;
    if (showArchived && !request.isArchived) return false;

    if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    if (filterCategory !== 'all' && request.category !== filterCategory) return false;
    if (filterUrgent === 'urgent' && !request.isUrgent) return false;
    if (filterUrgent === 'normal' && request.isUrgent) return false;
    if (debouncedSearchPnr && !request.pnrNumber.toLowerCase().includes(debouncedSearchPnr.toLowerCase())) return false;
    return true;
  });

  // Sort: urgent first, then by date
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const handleViewDetails = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleApprove = async (request: MaintenanceRequest) => {
    setIsProcessing(true);
    const success = await updateRequestStatus(request.id, 'aprovado');
    setIsProcessing(false);

    if (success) {
      toast({
        title: 'Solicitação aprovada',
        description: `A solicitação #${request.id.slice(0, 8)} foi aprovada com sucesso.`,
      });
      setShowDetailModal(false);
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a solicitação.',
        variant: 'destructive',
      });
    }
  };

  const handleDeny = async () => {
    if (!selectedRequest) return;
    if (!denialReason.trim()) {
      toast({
        title: 'Justificativa obrigatória',
        description: 'Por favor, informe o motivo da negativa.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    const success = await updateRequestStatus(selectedRequest.id, 'negado', denialReason.trim());
    setIsProcessing(false);

    if (success) {
      toast({
        title: 'Solicitação negada',
        description: `A solicitação #${selectedRequest.id.slice(0, 8)} foi negada.`,
      });
      setShowDenyModal(false);
      setShowDetailModal(false);
      setDenialReason('');
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível negar a solicitação.',
        variant: 'destructive',
      });
    }
  };

  const handleGeneratePdf = (request: MaintenanceRequest) => {
    // Open PDF generation in new window
    navigate(`/admin/ordem-servico/${request.id}`);
  };

  const pendingCount = requests.filter(r => r.status === 'pendente').length;
  const urgentCount = requests.filter(r => r.isUrgent && r.status === 'pendente').length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-6">
        <div className="container">
          {/* Header Actions */}
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="w-4 h-4 mr-2" />
              {showArchived ? 'Ver Ativos' : 'Ver Arquivados'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/pnrs')}>
              <Home className="w-4 h-4 mr-2" />
              Gerenciar PNRs
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="card-military">
              <CardContent className="py-4">
                <div className="text-2xl font-bold">{requests.length}</div>
                <div className="text-xs text-muted-foreground">Total de Solicitações</div>
              </CardContent>
            </Card>
            <Card className="card-military">
              <CardContent className="py-4">
                <div className="text-2xl font-bold text-pending">{pendingCount}</div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
              </CardContent>
            </Card>
            <Card className="card-military border-destructive/50">
              <CardContent className="py-4">
                <div className="text-2xl font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {urgentCount}
                </div>
                <div className="text-xs text-muted-foreground">Urgentes Pendentes</div>
              </CardContent>
            </Card>
            <Card className="card-military">
              <CardContent className="py-4">
                <div className="text-2xl font-bold text-success">
                  {requests.filter(r => r.status === 'aprovado').length}
                </div>
                <div className="text-xs text-muted-foreground">Aprovadas</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="card-military mb-6">
            <CardHeader className="py-4">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search-pnr" className="text-xs">Buscar PNR</Label>
                  <Input
                    id="search-pnr"
                    placeholder="Ex: PNR-001"
                    value={searchPnr}
                    onChange={e => setSearchPnr(e.target.value)}
                    className="input-military mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as RequestStatus | 'all')}>
                    <SelectTrigger className="input-military mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Categoria</Label>
                  <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as ServiceCategory | 'all')}>
                    <SelectTrigger className="input-military mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {Object.entries(SERVICE_CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Prioridade</Label>
                  <Select value={filterUrgent} onValueChange={(v) => setFilterUrgent(v as 'all' | 'urgent' | 'normal')}>
                    <SelectTrigger className="input-military mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="urgent">Urgentes</SelectItem>
                      <SelectItem value="normal">Normais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests List */}
          <div className="space-y-3">
            {sortedRequests.length > 0 ? (
              sortedRequests.map(request => (
                <Card
                  key={request.id}
                  className={`card-military ${request.isUrgent && request.status === 'pendente' ? 'border-destructive animate-pulse-urgent' : ''}`}
                >
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-semibold">{request.pnrNumber}</span>
                          <StatusBadge status={request.status} />
                          {request.isUrgent && <UrgentBadge />}
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {SERVICE_CATEGORIES[request.category]} • {request.pnrAddress}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(request.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        {request.status === 'aprovado' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGeneratePdf(request)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            O.S.
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="card-military">
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhuma solicitação encontrada com os filtros aplicados.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Detalhes da Solicitação #{selectedRequest?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selectedRequest.status} />
                {selectedRequest.isUrgent && <UrgentBadge />}

                {/* Toggle Urgent Button - Only for pending requests */}
                {selectedRequest.status === 'pendente' && (
                  <Button
                    variant={selectedRequest.isUrgent ? "destructive" : "outline"}
                    size="sm"
                    onClick={async () => {
                      const success = await toggleUrgent(selectedRequest.id, !selectedRequest.isUrgent);
                      if (success) {
                        toast({
                          title: selectedRequest.isUrgent ? 'Urgência removida' : 'Marcado como urgente',
                          description: `A solicitação foi ${selectedRequest.isUrgent ? 'desmarcada' : 'marcada'} como urgente.`,
                        });
                        // Update local state
                        setSelectedRequest({
                          ...selectedRequest,
                          isUrgent: !selectedRequest.isUrgent
                        });
                      } else {
                        toast({
                          title: 'Erro',
                          description: 'Não foi possível atualizar a urgência.',
                          variant: 'destructive',
                        });
                      }
                    }}
                    disabled={isProcessing}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {selectedRequest.isUrgent ? 'Remover Urgência' : 'Marcar Urgente'}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">PNR</Label>
                  <p className="font-medium">{selectedRequest.pnrNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Categoria</Label>
                  <p className="font-medium">{SERVICE_CATEGORIES[selectedRequest.category]}</p>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">Solicitante</Label>
                <p className="font-medium">
                  {selectedRequest.requesterRank} {selectedRequest.requesterName}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Endereço</Label>
                <p className="text-sm">{selectedRequest.pnrAddress}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <p className="text-sm">{selectedRequest.description}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Data da Solicitação</Label>
                <p className="text-sm">
                  {format(selectedRequest.createdAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>

              {/* Images */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Imagens Anexadas ({selectedRequest.images.length})</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedRequest.images.map((imageUrl, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSelectedImage(imageUrl);
                          setShowImageModal(true);
                        }}
                        className="block w-full"
                      >
                        <img
                          src={imageUrl}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-20 object-cover rounded border-2 border-border hover:border-primary transition-colors cursor-pointer"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.status === 'negado' && selectedRequest.denialReason && (
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded">
                  <Label className="text-xs text-destructive">Motivo da Negativa</Label>
                  <p className="text-sm">{selectedRequest.denialReason}</p>
                </div>
              )}

              {selectedRequest.status === 'pendente' && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Deletar
                  </Button>
                  <Button
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      setShowDenyModal(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Negar
                  </Button>
                  <Button onClick={() => handleApprove(selectedRequest)}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                </DialogFooter>
              )}

              {selectedRequest.status === 'aprovado' && !selectedRequest.isArchived && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const success = await archiveRequest(selectedRequest.id);
                      if (success) {
                        toast({ title: 'Arquivada', description: 'A solicitação foi arquivada.' });
                        setShowDetailModal(false);
                      } else {
                        toast({ title: 'Erro', description: 'Não foi possível arquivar.', variant: 'destructive' });
                      }
                    }}
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Arquivar
                  </Button>
                  <Button onClick={() => handleGeneratePdf(selectedRequest)}>
                    <FileText className="w-4 h-4 mr-1" />
                    Gerar O.S.
                  </Button>
                </DialogFooter>
              )}

              {selectedRequest.status === 'negado' && !selectedRequest.isArchived && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const success = await archiveRequest(selectedRequest.id);
                      if (success) {
                        toast({ title: 'Arquivada', description: 'A solicitação foi arquivada.' });
                        setShowDetailModal(false);
                      } else {
                        toast({ title: 'Erro', description: 'Não foi possível arquivar.', variant: 'destructive' });
                      }
                    }}
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Arquivar
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deny Modal */}
      <Dialog open={showDenyModal} onOpenChange={setShowDenyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Negar Solicitação</DialogTitle>
            <DialogDescription>
              Informe o motivo da negativa. Esta informação será visível para o morador.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="denial-reason">Justificativa *</Label>
              <Textarea
                id="denial-reason"
                placeholder="Descreva o motivo da negativa..."
                value={denialReason}
                onChange={e => setDenialReason(e.target.value)}
                className="input-military mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDenyModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeny}>
              Confirmar Negativa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Deletar Solicitação
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja <strong>deletar</strong> esta solicitação?
              <br />
              Esta ação <strong>não pode ser desfeita</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (selectedRequest) {
                  const success = await deleteRequest(selectedRequest.id);
                  if (success) {
                    toast({ title: '✓ Solicitação deletada', description: 'A solicitação foi removida com sucesso.' });
                    setShowDetailModal(false);
                  } else {
                    toast({ title: 'Erro', description: 'Não foi possível deletar.', variant: 'destructive' });
                  }
                }
                setShowDeleteDialog(false);
              }}
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Viewer Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Visualização da imagem"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
