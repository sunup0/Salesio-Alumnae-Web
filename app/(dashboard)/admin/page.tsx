'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Upload, CheckCircle, XCircle, FileSpreadsheet, PlusCircle } from "lucide-react"
import { toast } from "sonner"

export default function AdminPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">관리자 대시보드 ⚙️</h1>
                    <p className="text-muted-foreground">회원 관리 및 회비 납부 현황을 관리하세요.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">신규 가입 대기</CardTitle>
                        <PlusCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12명</div>
                        <p className="text-xs text-muted-foreground">승인이 필요한 신규 회원</p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">이번 달 회비 수납</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₩ 2,450,000</div>
                        <p className="text-xs text-muted-foreground">목표 대비 82% 달성</p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">미납 회원</CardTitle>
                        <XCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">45명</div>
                        <p className="text-xs text-muted-foreground">독려 문자 발송 필요</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Bulk Update */}
                <Card className="md:col-span-1 glass border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg">연락처 일괄 업데이트</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-primary/10 transition-colors cursor-pointer">
                            <FileSpreadsheet className="h-10 w-10 text-primary mb-2" />
                            <p className="text-sm font-medium">엑셀 파일 업로드</p>
                            <p className="text-xs text-muted-foreground">.xlsx, .csv 파일 지원</p>
                        </div>
                        <Button className="w-full" onClick={() => toast.info("업로드 준비 중", { description: "엑셀 파일 파싱 로직은 백엔드 연결 후 제공됩니다." })}>업로드 (Demo)</Button>
                    </CardContent>
                </Card>

                {/* Member List */}
                <Card className="md:col-span-2 glass">
                    <CardHeader>
                        <CardTitle className="text-lg">회원 승인 관리</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>이름</TableHead>
                                    <TableHead>기수</TableHead>
                                    <TableHead>가입일</TableHead>
                                    <TableHead>상태</TableHead>
                                    <TableHead className="text-right">관리</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { name: '신지영', cohort: '34회', date: '2024. 10. 18', status: '대기' },
                                    { name: '김태희', cohort: '35회', date: '2024. 10. 19', status: '대기' },
                                    { name: '이효리', cohort: '28회', date: '2024. 10. 19', status: '완료' },
                                ].map((member, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell>{member.cohort}</TableCell>
                                        <TableCell>{member.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={member.status === '완료' ? 'secondary' : 'outline'} className={member.status === '대기' ? 'text-orange-500 border-orange-200 bg-orange-50' : ''}>
                                                {member.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {member.status === '대기' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => toast.success("승인되었습니다", { description: `${member.name} 회원의 가입이 승인되었습니다.` })}>승인</Button>
                                                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => toast.error("거절되었습니다", { description: `${member.name} 회원의 가입이 거절되었습니다.` })}>거절</Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
