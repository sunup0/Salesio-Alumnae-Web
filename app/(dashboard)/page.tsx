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
  const [alumnaeStats, setAlumnaeStats] = useState({ cohort: [], region: [], job: [], total: 0 })

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
        total
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
            <div className="text-2xl font-bold">3명</div>
            <p className="text-xs text-muted-foreground mb-4">축하 메시지를 보내보세요!</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="bg-pink-100 text-pink-700">이</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">이미소 (31회)</p>
                </div>
                <Button size="sm" variant="ghost" className="ml-auto h-7 text-xs" onClick={(e) => { e.stopPropagation(); toast.success("축하 메시지를 보냈습니다! 🎉"); }}>축하하기</Button>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="bg-blue-100 text-blue-700">박</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">박수진 (28회)</p>
                </div>
                <Button size="sm" variant="ghost" className="ml-auto h-7 text-xs" onClick={(e) => { e.stopPropagation(); toast.success("축하 메시지를 보냈습니다! 🎉"); }}>축하하기</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget 2: Upcoming Events */}
        <Card className="glass border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => toast("준비 중", { description: "모임 페이지는 준비 중입니다." })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 모임 📅</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2건</div>
            <p className="text-xs text-muted-foreground mb-4">참여 가능한 행사가 있습니다.</p>
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/40 p-3 border border-border/50">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">30회 졸업 20주년 홈커밍</span>
                  <Badge variant="secondary" className="text-[10px] px-1 h-5 bg-pink-100 text-pink-700 hover:bg-pink-100">D-5</Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>모교 대강당 • 10월 24일</span>
                </div>
              </div>
              <div className="rounded-lg bg-muted/40 p-3 border border-border/50">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">서울지부 정기총회</span>
                  <Badge variant="outline" className="text-[10px] px-1 h-5">예정</Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>강남역 파이낸스센터 • 10월 30일</span>
                </div>
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
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground mb-4">지난달 대비 +5% 증가</p>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary/80 w-[82%] rounded-full" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-white/50 dark:bg-black/20 p-2 text-center cursor-pointer hover:bg-white/80 transition-colors" onClick={() => router.push('/directory?payment=paid')}>
                <p className="text-muted-foreground">납부 완료</p>
                <p className="font-bold text-primary">1,240명</p>
              </div>
              <div className="rounded-md bg-white/50 dark:bg-black/20 p-2 text-center cursor-pointer hover:bg-white/80 transition-colors" onClick={() => router.push('/directory?payment=unpaid')}>
                <p className="text-muted-foreground">미납</p>
                <p className="font-bold text-destructive">280명</p>
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
                <p className="text-xs text-muted-foreground">2시간 전 • 공지사항</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">
                📢 [공지] 2024년도 살레시오 동문 가을 운동회 개최 안내 <br /> <br />
                안녕하세요, 동문 여러분! 선선한 가을을 맞아 모두가 함께 즐길 수 있는 운동회를 준비했습니다.
                오랜만에 교정을 거닐며 선후배간의 정을 나누는 시간이 되시길 바랍니다.
              </p>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  이미지 (학교 전경)
                </div>
              </div>
            </CardContent>
            <div className="flex items-center justify-between p-4 pt-0 border-t border-border/30 mt-2">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Heart className="w-4 h-4" /> 45
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <MessageCircle className="w-4 h-4" /> 12
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Share2 className="w-4 h-4" /> 공유
              </Button>
            </div>
          </Card>

          {/* Post Card 2 */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
              <Avatar>
                <AvatarFallback className="bg-yellow-100 text-yellow-700">홍</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">홍길순 (25회)</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground">5시간 전 • 소소한 일상</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">
                손주가 처음으로 학교에 입학했습니다. 우리 학교 다닐 때 생각도 나고 감회가 새롭네요.
                다들 잘 지내시죠? ^^
              </p>
            </CardContent>
            <div className="flex items-center justify-between p-4 pt-0 border-t border-border/30 mt-2">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Heart className="w-4 h-4" /> 128
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <MessageCircle className="w-4 h-4" /> 34
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Share2 className="w-4 h-4" /> 공유
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
