'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Calendar, MapPin, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

// Mock Data for Kanban
const columns = [
    {
        id: 'planning',
        title: '기획 / 준비 중 📝',
        color: 'bg-yellow-500',
        items: [
            { id: 1, title: '2024 송년의 밤', type: '총동문회', date: '2024. 12. 15', participants: 0, location: '미정' },
            { id: 2, title: '제주도 올레길 트레킹', type: '소모임', date: '2024. 11. 10', participants: 5, location: '제주도' },
        ]
    },
    {
        id: 'open',
        title: '참여 접수 중 📢',
        color: 'bg-green-500',
        items: [
            { id: 3, title: '30회 졸업 20주년 홈커밍', type: '기수모임', date: '2024. 10. 24', participants: 42, location: '모교 대강당' },
            { id: 4, title: '가을 와인 테이스팅', type: '소모임', date: '2024. 10. 28', participants: 12, location: '강남 비노' },
        ]
    },
    {
        id: 'upcoming',
        title: '진행 예정 (마감) 🔒',
        color: 'bg-blue-500',
        items: [
            { id: 5, title: '서울지부 정기총회', type: '지역모임', date: '2024. 10. 30', participants: 85, location: '파이낸스센터' },
        ]
    },
    {
        id: 'done',
        title: '완료된 행사 ✅',
        color: 'bg-gray-500',
        items: [
            { id: 6, title: '개교 60주년 기념 음악회', type: '총동문회', date: '2024. 09. 15', participants: 300, location: '예술의전당' },
        ]
    }
]

export default function GatheringsPage() {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center px-1">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">행사 및 소모임 🎈</h1>
                    <p className="text-muted-foreground">다양한 모임을 한눈에 보고 참여하세요.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => toast("모임 만들기", { description: "새로운 모임 개설 양식을 불러옵니다." })}>
                    <Plus className="w-4 h-4" /> 모임 만들기
                </Button>
            </div>

            {/* Kanban Board Container */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full gap-6 min-w-max pb-4 px-1">
                    {columns.map((column) => (
                        <div key={column.id} className="w-80 flex flex-col bg-muted/30 dark:bg-muted/10 rounded-xl border border-border/50 backdrop-blur-sm">
                            {/* Column Header */}
                            <div className="p-4 flex items-center justify-between border-b border-border/50">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                    <h3 className="font-semibold text-sm">{column.title}</h3>
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{column.items.length}</Badge>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-4 h-4" /></Button>
                            </div>

                            {/* Items */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {column.items.map((item) => (
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
                                                    <span>{item.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span>{item.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span>{item.participants}명 참여</span>
                                                </div>
                                            </div>

                                            {column.id === 'open' && (
                                                <Button size="sm" className="w-full mt-2 h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={(e) => {
                                                    e.stopPropagation()
                                                    toast.success("신청되었습니다!", { description: `'${item.title}' 행사에 참여 접수되었습니다.` })
                                                }}>
                                                    참여 신청
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
