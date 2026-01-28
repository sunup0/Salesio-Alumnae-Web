'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Gift, TrendingUp, MoreHorizontal, Heart, MessageCircle, Share2, MapPin, UserPen } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const DEFAULT_PROFILE = {
  name: '김살레시오',
  cohort: '25',
  job: '변호사',
  company: '김앤장',
  introduction: '오늘도 살레시오 동문들과 함께 따뜻한 하루 보내세요.',
}

import { supabase } from "@/utils/supabase/client"

export default function DashboardPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState(DEFAULT_PROFILE)
  const [isLoaded, setIsLoaded] = useState(false)
  const [alumnaeStats, setAlumnaeStats] = useState({
    cohort: [], region: [], job: [], total: 0,
    paidCount: 0, unpaidCount: 0, paidPercent: 0, todayBirthdays: [] as any[]
  })

  // Load from LocalStorage (UserProfile) and Supabase (Stats)
  useEffect(() => {
    // User Profile
    const savedProfile = localStorage.getItem('salesio-user-profile')
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile)
      setUserProfile(parsed)
      setFormData(parsed) // Sync form data
    }

    // Alumnae Stats from Supabase
    const fetchStats = async () => {
      const { data, error } = await supabase.from('alumnae').select('*')

      if (error) {
        console.error('Error fetching stats:', error)
        return
      }

      const list = data || []
      const total = list.length

      // Dues Stats
      const paidCount = list.filter((p: any) => p.payment_status === 'paid').length
      const unpaidCount = list.filter((p: any) => p.payment_status === 'unpaid').length
      const paidPercent = total > 0 ? Math.round((paidCount / total) * 100) : 0

      // Birthday Stats
      const today = new Date()
      const todayStr = today.toISOString().slice(5, 10) // MM-DD
      const todayBirthdays = list.filter((p: any) => p.birthday && p.birthday.endsWith(todayStr))

      const countBy = (key: string) => {
        const counts: Record<string, number> = {}
        list.forEach((p: any) => {
          const val = p[key]
          if (val) counts[val] = (counts[val] || 0) + 1
        })
        return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([k, v]) => ({ key: k, count: v }))
      }

      setAlumnaeStats({
        cohort: countBy('cohort') as any,
        region: countBy('region') as any,
        job: countBy('job') as any,
        total,
        paidCount,
        unpaidCount,
        paidPercent,
        todayBirthdays
      })
      setIsLoaded(true)
    }

    fetchStats()
  }, [])

  // Save to LocalStorage
  const handleSave = () => {
    setUserProfile(formData)
    localStorage.setItem('salesio-user-profile', JSON.stringify(formData))
    setIsDialogOpen(false)
    toast.success("내 정보가 수정되었습니다.")
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setFormData(userProfile)
    }
  }, [isDialogOpen, userProfile])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">반갑습니다, {isLoaded ? userProfile.name : '...'}님! 👋</h1>
          <p className="text-muted-foreground mt-1">{isLoaded ? userProfile.introduction : '...'}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="glass gap-2">
                <UserPen className="w-4 h-4" /> 내 정보 수정
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background border-border shadow-lg">
              <DialogHeader>
                <DialogTitle>내 정보 수정</DialogTitle>
                <DialogDescription>
                  프로필 정보를 업데이트합니다. 변경 내용은 즉시 반영됩니다.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">이름</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cohort" className="text-right">기수</Label>
                  <Input id="cohort" value={formData.cohort} onChange={(e) => setFormData({ ...formData, cohort: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="job" className="text-right">직업</Label>
                  <Input id="job" value={formData.job} onChange={(e) => setFormData({ ...formData, job: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company" className="text-right">소속</Label>
                  <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="intro" className="text-right">상태메시지</Label>
                  <Input id="intro" value={formData.introduction} onChange={(e) => setFormData({ ...formData, introduction: e.target.value })} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleSave}>저장하기</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button className="bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => toast("글쓰기 모드", { description: "새로운 소식을 작성합니다." })}>글쓰기</Button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Widget 1: Birthdays */}
        <Card className="glass border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/directory?birthday=today')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 생일인 동문 🎂</CardTitle>
            <Gift className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alumnaeStats.todayBirthdays.length}명</div>
            <p className="text-xs text-muted-foreground mb-4">축하 메시지를 보내보세요!</p>
            <div className="space-y-3">
              {alumnaeStats.todayBirthdays.slice(0, 2).map((person: any) => (
                <div key={person.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="bg-pink-100 text-pink-700">{person.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{person.name} ({person.cohort}회)</p>
                  </div>
                  <Button size="sm" variant="ghost" className="ml-auto h-7 text-xs" onClick={(e) => { e.stopPropagation(); toast.success("축하 메시지를 보냈습니다! 🎉"); }}>축하하기</Button>
                </div>
              ))}
              {alumnaeStats.todayBirthdays.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">오늘 생일인 동문이 없습니다.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Widget 2: Upcoming Events */}
        <Card className="glass border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast("준비 중", { description: "모임 페이지는 준비 중입니다 곧 오픈됩니다!" })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 모임 📅</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0건</div>
            <p className="text-xs text-muted-foreground mb-4">예정된 행사가 없습니다.</p>
            <div className="space-y-3">
              <div className="text-center py-6 text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                등록된 모임이 없습니다.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget 3: Dues Status (Admin View) */}
        <Card className="glass border-none shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50/50 dark:from-background dark:to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">회비 납부 현황 💰</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alumnaeStats.paidPercent}%</div>
            <p className="text-xs text-muted-foreground mb-4">전체 {alumnaeStats.total}명 중</p>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary/80 rounded-full transition-all duration-1000" style={{ width: `${alumnaeStats.paidPercent}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-white/50 dark:bg-black/20 p-2 text-center cursor-pointer hover:bg-white/80 transition-colors" onClick={() => router.push('/directory?payment=paid')}>
                <p className="text-muted-foreground">납부 완료</p>
                <p className="font-bold text-primary">{alumnaeStats.paidCount}명</p>
              </div>
              <div className="rounded-md bg-white/50 dark:bg-black/20 p-2 text-center cursor-pointer hover:bg-white/80 transition-colors" onClick={() => router.push('/directory?payment=unpaid')}>
                <p className="text-muted-foreground">미납</p>
                <p className="font-bold text-destructive">{alumnaeStats.unpaidCount}명</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserPen className="w-4 h-4 text-primary" /> 기수별 현황 (Top 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alumnaeStats.cohort.length > 0 ? alumnaeStats.cohort.map((item: any, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm cursor-pointer hover:bg-primary/10 p-1 rounded transition-colors group"
                  onClick={() => router.push(`/directory?cohort=${item.key}`)}
                >
                  <span className="text-muted-foreground group-hover:text-primary transition-colors">{item.key}회</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${(item.count / alumnaeStats.total) * 100}%` }} />
                    </div>
                    <span className="font-bold w-8 text-right text-foreground">{item.count}명</span>
                  </div>
                </div>
              )) : <p className="text-xs text-muted-foreground text-center py-4">데이터가 없습니다.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" /> 지역별 현황 (Top 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alumnaeStats.region.length > 0 ? alumnaeStats.region.map((item: any, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm cursor-pointer hover:bg-green-500/10 p-1 rounded transition-colors group"
                  onClick={() => router.push(`/directory?region=${item.key}`)}
                >
                  <span className="text-muted-foreground group-hover:text-green-700 transition-colors">{item.key}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500/60 rounded-full" style={{ width: `${(item.count / alumnaeStats.total) * 100}%` }} />
                    </div>
                    <span className="font-bold w-8 text-right text-foreground">{item.count}명</span>
                  </div>
                </div>
              )) : <p className="text-xs text-muted-foreground text-center py-4">데이터가 없습니다.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MoreHorizontal className="w-4 h-4 text-purple-600" /> 직업별 현황 (Top 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alumnaeStats.job.length > 0 ? alumnaeStats.job.map((item: any, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm cursor-pointer hover:bg-purple-500/10 p-1 rounded transition-colors group"
                  onClick={() => router.push(`/directory?search=${item.key}`)}
                >
                  <span className="text-muted-foreground group-hover:text-purple-700 transition-colors">{item.key}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500/60 rounded-full" style={{ width: `${(item.count / alumnaeStats.total) * 100}%` }} />
                    </div>
                    <span className="font-bold w-8 text-right text-foreground">{item.count}명</span>
                  </div>
                </div>
              )) : <p className="text-xs text-muted-foreground text-center py-4">데이터가 없습니다.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News Feed Section */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Main Feed */}
        <div className="md:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold px-1">최신 소식</h2>

          {/* Post Card 1 */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>총동</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">동문회 사무국</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground">공지사항</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">
                📢 환영합니다! <br /> <br />
                살레시오 여고 동문회 온라인 플랫폼에 오신 것을 환영합니다.
                이곳에서 동문 찾기, 소식 공유, 모임 참여 등 다양한 활동을 즐겨보세요.<br />
                현재 시스템 안정화 및 데이터 마이그레이션 작업이 진행 중입니다.
              </p>
            </CardContent>
            <div className="flex items-center justify-between p-4 pt-0 border-t border-border/30 mt-2">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Heart className="w-4 h-4" /> 5
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <MessageCircle className="w-4 h-4" /> 0
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Sidebar (Trending/Recommend) */}
        <div className="hidden md:block space-y-4">
          <Card className="glass border-none bg-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">추천 동문 / 소모임</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs">🎨</div>
                <div>
                  <p className="text-sm font-medium">수채화 그리기</p>
                  <p className="text-xs text-muted-foreground">회원 15명 • 매주 목</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs">⛰️</div>
                <div>
                  <p className="text-sm font-medium">관악산 등반대</p>
                  <p className="text-xs text-muted-foreground">회원 42명 • 월 1회</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
