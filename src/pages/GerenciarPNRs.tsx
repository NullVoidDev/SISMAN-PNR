import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, Home, Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { usePNRs } from '@/contexts/PNRContext';
import { PNR } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

export default function GerenciarPNRs() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { pnrs, isLoading, addPNR, updatePNR, deletePNR } = usePNRs();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedPNR, setSelectedPNR] = useState<PNR | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form state
    const [formNumber, setFormNumber] = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [formBlock, setFormBlock] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/admin/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        );
    }

    // Aplicar debounce na busca para evitar filtros a cada tecla
    const debouncedSearch = useDebounce(searchTerm, 300);

    const filteredPNRs = pnrs.filter(
        pnr =>
            pnr.number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            pnr.address.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            pnr.block.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const resetForm = () => {
        setFormNumber('');
        setFormAddress('');
        setFormBlock('');
    };

    const handleAdd = async () => {
        if (!formNumber.trim() || !formAddress.trim() || !formBlock.trim()) {
            toast({
                title: 'Campos obrigatórios',
                description: 'Preencha todos os campos.',
                variant: 'destructive',
            });
            return;
        }

        setIsProcessing(true);
        const result = await addPNR({
            number: formNumber.trim(),
            address: formAddress.trim(),
            block: formBlock.trim(),
        });
        setIsProcessing(false);

        if (result) {
            toast({
                title: 'PNR adicionada',
                description: `${formNumber} foi adicionada com sucesso.`,
            });
            setShowAddModal(false);
            resetForm();
        } else {
            toast({
                title: 'Erro',
                description: 'Não foi possível adicionar a PNR. Verifique se o número já existe.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = async () => {
        if (!selectedPNR) return;
        if (!formNumber.trim() || !formAddress.trim() || !formBlock.trim()) {
            toast({
                title: 'Campos obrigatórios',
                description: 'Preencha todos os campos.',
                variant: 'destructive',
            });
            return;
        }

        setIsProcessing(true);
        const result = await updatePNR(selectedPNR.id, {
            number: formNumber.trim(),
            address: formAddress.trim(),
            block: formBlock.trim(),
        });
        setIsProcessing(false);

        if (result) {
            toast({
                title: 'PNR atualizada',
                description: `${formNumber} foi atualizada com sucesso.`,
            });
            setShowEditModal(false);
            setSelectedPNR(null);
            resetForm();
        } else {
            toast({
                title: 'Erro',
                description: 'Não foi possível atualizar a PNR.',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async () => {
        if (!selectedPNR) return;

        setIsProcessing(true);
        const result = await deletePNR(selectedPNR.id);
        setIsProcessing(false);

        if (result) {
            toast({
                title: 'PNR removida',
                description: `${selectedPNR.number} foi removida com sucesso.`,
            });
            setShowDeleteDialog(false);
            setSelectedPNR(null);
        } else {
            toast({
                title: 'Erro',
                description: 'Não foi possível remover a PNR. Ela pode ter solicitações vinculadas.',
                variant: 'destructive',
            });
        }
    };

    const openEditModal = (pnr: PNR) => {
        setSelectedPNR(pnr);
        setFormNumber(pnr.number);
        setFormAddress(pnr.address);
        setFormBlock(pnr.block);
        setShowEditModal(true);
    };

    const openDeleteDialog = (pnr: PNR) => {
        setSelectedPNR(pnr);
        setShowDeleteDialog(true);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 py-6">
                <div className="container">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={() => navigate('/admin')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
                                <Home className="w-6 h-6" />
                                Gerenciar PNRs
                            </h1>
                        </div>
                        <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nova PNR
                        </Button>
                    </div>

                    {/* Search */}
                    <Card className="card-military mb-6">
                        <CardContent className="py-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por número, endereço ou bloco..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="input-military pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card className="card-military">
                            <CardContent className="py-4">
                                <div className="text-2xl font-bold">{pnrs.length}</div>
                                <div className="text-xs text-muted-foreground">Total de PNRs</div>
                            </CardContent>
                        </Card>
                        <Card className="card-military">
                            <CardContent className="py-4">
                                <div className="text-2xl font-bold">
                                    {[...new Set(pnrs.map(p => p.block))].length}
                                </div>
                                <div className="text-xs text-muted-foreground">Blocos</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* List */}
                    {isLoading ? (
                        <Card className="card-military">
                            <CardContent className="py-8 text-center text-muted-foreground">
                                Carregando PNRs...
                            </CardContent>
                        </Card>
                    ) : filteredPNRs.length > 0 ? (
                        <div className="space-y-2">
                            {filteredPNRs.map(pnr => (
                                <Card key={pnr.id} className="card-military">
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-primary">{pnr.number}</span>
                                                    <span className="text-xs bg-muted px-2 py-1 rounded">
                                                        Bloco {pnr.block}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{pnr.address}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditModal(pnr)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                    onClick={() => openDeleteDialog(pnr)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="card-military">
                            <CardContent className="py-8 text-center text-muted-foreground">
                                {searchTerm ? 'Nenhuma PNR encontrada.' : 'Nenhuma PNR cadastrada.'}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            {/* Add Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-heading">Nova PNR</DialogTitle>
                        <DialogDescription>
                            Adicione uma nova casa PNR ao sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="number">Número da PNR *</Label>
                            <Input
                                id="number"
                                placeholder="Ex: PNR-001"
                                value={formNumber}
                                onChange={e => setFormNumber(e.target.value)}
                                className="input-military mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Endereço Completo *</Label>
                            <Input
                                id="address"
                                placeholder="Ex: Rua das Palmeiras, 10"
                                value={formAddress}
                                onChange={e => setFormAddress(e.target.value)}
                                className="input-military mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="block">Bloco/Quadra *</Label>
                            <Input
                                id="block"
                                placeholder="Ex: A"
                                value={formBlock}
                                onChange={e => setFormBlock(e.target.value)}
                                className="input-military mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAdd} disabled={isProcessing}>
                            {isProcessing ? 'Salvando...' : 'Adicionar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-heading">Editar PNR</DialogTitle>
                        <DialogDescription>
                            Atualize os dados da casa PNR.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-number">Número da PNR *</Label>
                            <Input
                                id="edit-number"
                                placeholder="Ex: PNR-001"
                                value={formNumber}
                                onChange={e => setFormNumber(e.target.value)}
                                className="input-military mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-address">Endereço Completo *</Label>
                            <Input
                                id="edit-address"
                                placeholder="Ex: Rua das Palmeiras, 10"
                                value={formAddress}
                                onChange={e => setFormAddress(e.target.value)}
                                className="input-military mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-block">Bloco/Quadra *</Label>
                            <Input
                                id="edit-block"
                                placeholder="Ex: A"
                                value={formBlock}
                                onChange={e => setFormBlock(e.target.value)}
                                className="input-military mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleEdit} disabled={isProcessing}>
                            {isProcessing ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover PNR?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover <strong>{selectedPNR?.number}</strong>?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isProcessing ? 'Removendo...' : 'Remover'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
