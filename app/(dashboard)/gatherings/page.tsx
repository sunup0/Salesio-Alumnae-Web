'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Users, Calendar, MapPin, MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/utils/supabase/client"

type Gathering = {
    id: number
    title: string
    type: string
    status: 'planning' | 'open' | 'upcoming' | 'done'
    date: string
    location: string
    participants: number
}

const COLUMNS = [
    { id: 'planning', title: '기획 / 준비 중 📝', color: 'bg-yellow-500' },
    { id: 'open', title: '참여 접수 중 📢', color: 'bg-green-500' },
    { id: 'upcoming', title: '진행 예정 (마감) 🔒', color: 'bg-blue-500' },
    { id: 'done', title: '완료된 행사 ✅', color: 'bg-gray-500' }
]

export default function GatheringsPage() {
    const [gatherings, setGatherings] = useState<Gathering[]>([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: '소모임',
        status: 'open',
        date: '',
        location: ''
    })

    const fetchGatherings = async () => {
        const { data, error } = await supabase
            .from('gatherings')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching gatherings:', error)
            toast.error("데이터를 불러오는데 실패했습니다.")
        } else {
            setGatherings(data as Gathering[] || [])
        }
        setIsLoaded(true)
    }

    useEffect(() => {
        fetchGatherings()
    }, [])

    const handleCreate = async () => {
        if (!formData.title) {
            toast.error("모임 이름을 입력해주세요.")
            return
        }

        setIsSubmitting(true)
        const newGathering = {
            ...formData,
            participants: 0
        }

        const { error } = await supabase
            .from('gatherings')
            .insert([newGathering])

        setIsSubmitting(false)

        if (error) {
            console.error(error)
            toast.error("등록 실패", { description: error.message })
        } else {
            toast.success("모임이 등록되었습니다!")
            setIsDialogOpen(false)
            setFormData({ title: '', type: '소모임', status: 'open', date: '', location: '' })
            fetchGatherings()
        }
    }

    const handleParticipate = async (id: number, currentCount: number, title: string) => {
        const { error } = await supabase
            .from('gatherings')
            .update({ participants: currentCount + 1 })
            .eq('id', id)

        if (error) {
            toast.error("신청 실패")
        } else {
            toast.success("신청되었습니다!", { description: `'${title}' 행사에 참여 접수되었습니다.` })
            // Optimistic update
            setGatherings(prev => prev.map(g => g.id === id ? { ...g, participants: g.participants + 1 } : g))
        }
    }

    const getColumnItems = (status: string) => gatherings.filter(g => g.status === status)

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center px-1">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">행사 및 소모임 🎈</h1>
                    <p className="text-muted-foreground">다양한 모임을 한눈에 보고 참여하세요.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 gap-2">
                            <Plus className="w-4 h-4" /> 모임 만들기
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>새로운 모임 개설</DialogTitle>
                            <DialogDescription>
                                동문들과 함께할 소중한 모임을 만들어보세요.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">모임 이름 <span className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    placeholder="예: 가을 와인 테이스팅"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>유형</Label>
                                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="총동문회">총동문회</SelectItem>
                                            <SelectItem value="기수모임">기수모임</SelectItem>
                                            <SelectItem value="지역모임">지역모임</SelectItem>
                                            <SelectItem value="소모임">소모임</SelectItem>
                                            <SelectItem value="기타">기타</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>진행 상태</Label>
                                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planning">기획 중</SelectItem>
                                            <SelectItem value="open">접수 중</SelectItem>
                                            <SelectItem value="upcoming">마감/진행예정</SelectItem>
                                            <SelectItem value="done">완료됨</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">일시</Label>
                                <Input
                                    id="date"
                                    placeholder="예: 2024. 10. 25 (금) 19:00"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">장소</Label>
                                <Input
                                    id="location"
                                    placeholder="예: 서울 강남구 테헤란로 123"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                            <Button onClick={handleCreate} disabled={isSubmitting}>
                                {isSubmitting ? '등록 중...' : '등록하기'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Kanban Board Container */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full gap-6 min-w-max pb-4 px-1">
                    {COLUMNS.map((column) => {
                        const items = getColumnItems(column.id)

                        return (
                            <div key={column.id} className="w-80 flex flex-col bg-muted/30 dark:bg-muted/10 rounded-xl border border-border/50 backdrop-blur-sm">
                                {/* Column Header */}
                                <div className="p-4 flex items-center justify-between border-b border-border/50">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                        <h3 className="font-semibold text-sm">{column.title}</h3>
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{items.length}</Badge>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-4 h-4" /></Button>
                                </div>

                                {/* Items */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                    {!isLoaded ? (
                                        <div className="flex justify-center p-4">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : items.length === 0 ? (
                                        <div className="text-center py-8 text-xs text-muted-foreground/50">
                                            등록된 모임이 없습니다.
                                        </div>
                                    ) : (
                                        items.map((item) => (
                                            <Card key={item.id} className="glass shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <Badge variant="outline" className="bg-background/50 text-[10px]">{item.type}</Badge>
                                                        {column.id === 'open' && (
                                                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px]">접수중</Badge>
                                                        )}
                                                    </div>

                                                    <h4 className="font-semibold text-base group-hover:text-primary transition-colors">{item.title}</h4>

                                                    <div className="space-y-1.5 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            <span>{item.date || '일시 미정'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            <span>{item.location || '장소 미정'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-3.5 h-3.5" />
                                                            <span>{item.participants}명 참여</span>
                                                        </div>
                                                    </div>

                                                    {column.id === 'open' && (
                                                        <Button size="sm" className="w-full mt-2 h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleParticipate(item.id, item.participants, item.title)
                                                        }}>
                                                            참여 신청
                                                        </Button>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
