'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Image as ImageIcon } from "lucide-react"

export default function LibraryPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-primary">추억 아카이브 📚</h1>
                <p className="text-muted-foreground">살레시오의 소중한 순간들과 기록들을 보관소입니다.</p>
            </div>

            <Tabs defaultValue="gallery" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                    <TabsTrigger value="gallery">사진첩 (Gallery)</TabsTrigger>
                    <TabsTrigger value="newsletter">동문보 (Newsletter)</TabsTrigger>
                </TabsList>

                {/* Gallery Tab */}
                <TabsContent value="gallery" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Mock Photos */}
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                            <div key={item} className="group relative aspect-square overflow-hidden rounded-xl bg-muted glass border border-border/50 cursor-pointer">
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/30 group-hover:bg-secondary/20 transition-colors">
                                    <ImageIcon className="w-8 h-8 opacity-50" />
                                </div>
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <p className="text-white text-sm font-semibold">2023 체육대회</p>
                                    <p className="text-white/80 text-xs">2023. 10. 15</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <Button variant="outline" className="glass">더 많은 사진 보기</Button>
                    </div>
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
