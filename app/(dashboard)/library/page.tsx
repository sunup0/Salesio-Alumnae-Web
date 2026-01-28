'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileText, Image as ImageIcon, Plus, Upload, X } from "lucide-react"
import { supabase } from "@/utils/supabase/client"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default function LibraryPage() {
    const [archivePhotos, setArchivePhotos] = useState<any[]>([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [uploading, setUploading] = useState(false)

    // Upload Form State
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        taken_at: new Date().toISOString().slice(0, 10)
    })

    const fetchPhotos = async () => {
        setIsLoaded(false)
        const { data, error } = await supabase
            .from('archive_photos')
            .select('*')
            .order('taken_at', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching photos:', error)
            toast.error("사진을 불러오는데 실패했습니다.")
        } else {
            setArchivePhotos(data || [])
        }
        setIsLoaded(true)
    }

    useEffect(() => {
        fetchPhotos()
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error("파일 크기는 5MB 이하여야 합니다.")
            return
        }

        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("사진을 선택해주세요.")
            return
        }
        if (!formData.title.trim()) {
            toast.error("제목을 입력해주세요.")
            return
        }

        const toastId = toast.loading("사진을 업로드하고 있습니다...")
        setUploading(true)

        try {
            // 1. Storage Upload
            const fileExt = selectedFile.name.split('.').pop()
            const fileName = `archive-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const bucket = 'alumnae-photos'

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, selectedFile)

            if (uploadError) throw new Error(`업로드 실패: ${uploadError.message}`)

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName)

            // 2. DB Insert
            const { error: dbError } = await supabase
                .from('archive_photos')
                .insert([{
                    photo_url: publicUrl,
                    title: formData.title,
                    description: formData.description,
                    taken_at: formData.taken_at
                }])

            if (dbError) throw dbError

            toast.success("사진이 등록되었습니다!", { id: toastId })

            // Reset & Refresh
            setIsDialogOpen(false)
            setSelectedFile(null)
            setPreviewUrl(null)
            setFormData({
                title: '',
                description: '',
                taken_at: new Date().toISOString().slice(0, 10)
            })
            fetchPhotos()

        } catch (error: any) {
            console.error(error)
            toast.error("등록 실패", {
                description: error.message,
                id: toastId
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">추억 아카이브 📚</h1>
                    <p className="text-muted-foreground">살레시오의 소중한 순간들과 기록들을 보관소입니다.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> 사진 등록
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>새로운 추억 등록</DialogTitle>
                            <DialogDescription>
                                동문들과 공유하고 싶은 소중한 사진을 올려주세요.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {/* Image Preview Area */}
                            <div className="flex flex-col items-center gap-4">
                                <div className={`w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center relative overflow-hidden bg-muted/30 ${!previewUrl ? 'hover:bg-muted/50 cursor-pointer' : ''}`}>
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 shadow-md"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedFile(null)
                                                    setPreviewUrl(null)
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center gap-2 cursor-pointer w-full h-full justify-center">
                                            <div className="p-4 rounded-full bg-primary/10 text-primary">
                                                <ImageIcon className="w-8 h-8" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">클릭하여 사진 선택</span>
                                            <span className="text-xs text-muted-foreground/70">JPG, PNG (최대 5MB)</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="title">제목 <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    placeholder="예: 2023 가을 운동회"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="taken_at">촬영일</Label>
                                <Input
                                    id="taken_at"
                                    type="date"
                                    value={formData.taken_at}
                                    onChange={(e) => setFormData({ ...formData, taken_at: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">설명 (선택)</Label>
                                <Input
                                    id="description"
                                    placeholder="사진에 대한 간단한 설명을 남겨주세요."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                            <Button onClick={handleUpload} disabled={uploading}>
                                {uploading ? '업로드 중...' : '등록하기'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="gallery" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                    <TabsTrigger value="gallery">사진첩 (Gallery)</TabsTrigger>
                    <TabsTrigger value="newsletter">동문보 (Newsletter)</TabsTrigger>
                </TabsList>

                {/* Gallery Tab */}
                <TabsContent value="gallery" className="mt-6">
                    {archivePhotos.length === 0 && isLoaded ? (
                        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
                            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground">등록된 사진이 없습니다.</h3>
                            <p className="text-sm text-muted-foreground/70 mt-1">첫 번째 추억을 등록해보세요!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {archivePhotos.map((photo) => (
                                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-muted glass border border-border/50 cursor-pointer shadow-sm hover:shadow-md transition-all">
                                    <img
                                        src={photo.photo_url}
                                        alt={photo.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <p className="text-white text-sm font-bold truncate">{photo.title}</p>
                                        <div className="flex justify-between items-end mt-1">
                                            <p className="text-white/80 text-xs">{photo.taken_at}</p>
                                            {photo.description && (
                                                <p className="text-white/60 text-[10px] line-clamp-1 max-w-[70%]">{photo.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Newsletter Tab */}
                <TabsContent value="newsletter" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <Card key={item} className="glass hover:shadow-lg transition-all">
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                        <FileText className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">살레시오 동문보 {100 + item}호</h3>
                                        <p className="text-sm text-muted-foreground">2024년 {item * 3}월 발행</p>
                                    </div>
                                    <Button className="w-full gap-2" variant="outline">
                                        <Download className="w-4 h-4" /> PDF 다운로드
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
