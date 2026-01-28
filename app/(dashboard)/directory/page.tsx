'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, MapPin, Briefcase, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Mail, Phone, Hash } from "lucide-react"
import { fakerKO as faker } from '@faker-js/faker'
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
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

// Mock Data Generation
const generateAlumnae = (count: number, startId: number = 1) => {
    return Array.from({ length: count }, (_, i) => ({
        id: startId + i,
        name: faker.person.fullName(),
        cohort: faker.number.int({ min: 1, max: 60 }),
        region: faker.helpers.arrayElement(['서울 강남', '서울 서초', '서울 마포', '경기 분당', '부산 해운대', '미국 뉴욕', '호주 시드니', '광주 동구', '대구 수성']),
        job: faker.person.jobTitle(),
        company: faker.company.name(),
        tags: faker.helpers.arrayElements(['IT', '스타트업', '법률', '의료', '교육', 'F&B', '금융', '예술', '해외', '마케팅'], { min: 1, max: 2 }),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        introduction: faker.lorem.paragraph(),
        birthday: faker.date.birthdate().toISOString().slice(5, 10), // MM-DD
        paymentStatus: faker.helpers.arrayElement(['paid', 'unpaid']),
    })).sort((a, b) => a.name.localeCompare(b.name))
}

const ITEMS_PER_PAGE = 12

export default function DirectoryPage() {
    const searchParams = useSearchParams()

    // State for Alumnae List
    const [alumnaeList, setAlumnaeList] = useState<any[]>([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedAlumna, setSelectedAlumna] = useState<any>(null)
    const [editingId, setEditingId] = useState<number | null>(null)

    // Filter States
    const [selectedRegions, setSelectedRegions] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [cohortRange, setCohortRange] = useState([1, 60])
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
    const [birthdayFilter, setBirthdayFilter] = useState<'all' | 'today' | 'month'>('all')

    const uniqueRegions = useMemo(() => Array.from(new Set(alumnaeList.map(a => a.region))).sort(), [alumnaeList])
    const uniqueTags = useMemo(() => Array.from(new Set(alumnaeList.flatMap(a => a.tags))).sort(), [alumnaeList])

    // Load data from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('salesio-alumnae-list')
        if (saved) {
            setAlumnaeList(JSON.parse(saved))
        } else {
            // Initial data set to 500 as requested
            const initialData = generateAlumnae(500)
            setAlumnaeList(initialData)
            localStorage.setItem('salesio-alumnae-list', JSON.stringify(initialData))
        }
        setIsLoaded(true)
    }, [])



    // Apply URL Params Filters
    useEffect(() => {
        const cohortParam = searchParams.get('cohort')
        const regionParam = searchParams.get('region')
        const searchParam = searchParams.get('search')
        const paymentParam = searchParams.get('payment')
        const birthdayParam = searchParams.get('birthday')

        if (cohortParam) {
            const cohort = parseInt(cohortParam)
            if (!isNaN(cohort)) {
                setCohortRange([cohort, cohort])
            }
        }
        if (regionParam) {
            setSelectedRegions([regionParam])
        }
        if (searchParam) {
            setSearchTerm(searchParam)
        }
        if (paymentParam === 'paid' || paymentParam === 'unpaid') {
            setPaymentFilter(paymentParam)
        }
        if (birthdayParam === 'today' || birthdayParam === 'month') {
            setBirthdayFilter(birthdayParam)
        }

        const tagParam = searchParams.get('tag')
        if (tagParam) {
            setSelectedTags([tagParam])
        }
    }, [searchParams])

    // Save to LocalStorage whenever list changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('salesio-alumnae-list', JSON.stringify(alumnaeList))
        }
    }, [alumnaeList, isLoaded])


    // Form State
    const [formData, setFormData] = useState({
        name: '',
        cohort: '',
        region: '서울 강남',
        job: '',
        company: '',
        email: '',
        phone: '',
        introduction: '',
        tags: '',
    })

    // Filter Logic
    const filteredAlumnae = useMemo(() => {
        if (!isLoaded) return []

        return alumnaeList.filter(person => {
            const matchesSearch =
                person.name.includes(searchTerm) ||
                person.cohort.toString().includes(searchTerm) ||
                person.job.includes(searchTerm) ||
                person.tags.some((tag: string) => tag.includes(searchTerm))

            const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(person.region)
            const matchesCohort = person.cohort >= cohortRange[0] && person.cohort <= cohortRange[1]
            const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => person.tags.includes(tag))

            let matchesPayment = true
            if (paymentFilter !== 'all') {
                matchesPayment = person.paymentStatus === paymentFilter
            }

            let matchesBirthday = true
            if (birthdayFilter !== 'all') {
                const today = new Date()
                const todayStr = today.toISOString().slice(5, 10) // MM-DD
                const personBirthMM = person.birthday?.slice(0, 2)
                const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0')

                if (birthdayFilter === 'today') {
                    matchesBirthday = person.birthday === todayStr
                } else if (birthdayFilter === 'month') {
                    matchesBirthday = personBirthMM === currentMonth
                }
            }

            return matchesSearch && matchesRegion && matchesCohort && matchesTags && matchesPayment && matchesBirthday
        })
    }, [searchTerm, alumnaeList, selectedRegions, cohortRange, selectedTags, paymentFilter, birthdayFilter])

    // Pagination Logic
    const totalPages = Math.ceil(filteredAlumnae.length / ITEMS_PER_PAGE)
    const paginatedAlumnae = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredAlumnae.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredAlumnae, currentPage])

    // Handlers
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const toggleRegion = (region: string) => {
        setSelectedRegions(prev =>
            prev.includes(region)
                ? prev.filter(r => r !== region)
                : [...prev, region]
        )
        setCurrentPage(1)
    }

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
        setCurrentPage(1)
    }

    const resetFilters = () => {
        setSelectedRegions([])
        setSelectedTags([])
        setCohortRange([1, 60])
        setPaymentFilter('all')
        setBirthdayFilter('all')
        setCurrentPage(1)
        toast.info("필터가 초기화되었습니다.")
    }

    const handleDeleteAll = () => {
        if (window.confirm("정말로 모든 동문 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            setAlumnaeList([])
            localStorage.removeItem('salesio-alumnae-list')
            toast.success("모든 데이터가 삭제되었습니다.")
        }
    }

    // Individual Delete
    const handleDelete = (id: number) => {
        if (window.confirm("이 동문 정보를 삭제하시겠습니까?")) {
            setAlumnaeList(prev => prev.filter(p => p.id !== id))
            setSelectedAlumna(null) // Close detail sheet
            toast.success("삭제되었습니다.")
        }
    }

    // Prepare Edit
    const handleEdit = (alumna: any) => {
        setFormData({
            name: alumna.name,
            cohort: alumna.cohort.toString(),
            region: alumna.region,
            job: alumna.job,
            company: alumna.company,
            email: alumna.email,
            phone: alumna.phone,
            introduction: alumna.introduction,
            tags: alumna.tags.join(', '),
        })
        setEditingId(alumna.id)
        setIsDialogOpen(true)
    }

    const handleSubmit = () => {
        // Validation
        const errors: string[] = []
        if (!formData.name.trim()) errors.push("이름")
        if (!formData.cohort) errors.push("기수")
        if (formData.cohort && isNaN(parseInt(formData.cohort))) errors.push("기수(숫자)")

        if (errors.length > 0) {
            toast.error("입력 정보를 확인해주세요", {
                description: `다음 항목이 누락되었거나 잘못되었습니다: ${errors.join(', ')}`
            })
            return
        }

        const commonData = {
            name: formData.name,
            cohort: parseInt(formData.cohort),
            region: formData.region as any,
            job: formData.job || '직업 미입력',
            company: formData.company || '소속 미입력',
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : ['신규회원'],
            email: formData.email || 'email@example.com',
            phone: formData.phone || '010-0000-0000',
            introduction: formData.introduction || '안녕하세요!',
            birthday: faker.date.birthdate().toISOString().slice(5, 10), // Random for new
            paymentStatus: 'unpaid' // Default
        }

        if (editingId) {
            // Update Existing
            setAlumnaeList(prev => prev.map(p => p.id === editingId ? { ...p, ...commonData } : p))

            // If currently viewing this person, update the view too
            if (selectedAlumna && selectedAlumna.id === editingId) {
                setSelectedAlumna({ ...selectedAlumna, ...commonData })
            }

            toast.success("정보가 수정되었습니다.")
        } else {
            // Create New
            const newAlumna = {
                id: alumnaeList.length > 0 ? Math.max(...alumnaeList.map(a => a.id)) + 1 : 1,
                ...commonData
            }
            setAlumnaeList([newAlumna, ...alumnaeList])
            toast.success("등록되었습니다!", {
                description: `${newAlumna.name} 동문님이 명단에 추가되었습니다.`
            })
            setSearchTerm('')
            setCurrentPage(1)
        }

        setIsDialogOpen(false)
        setEditingId(null)
        setFormData({
            name: '', cohort: '', region: '서울 강남', job: '', company: '',
            email: '', phone: '', introduction: '', tags: ''
        })
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">동문 인명록 👥</h1>
                    <p className="text-muted-foreground mt-1">총 {alumnaeList.length}명의 자랑스러운 동문들이 등록되어 있습니다.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="이름, 기수, 직업, 태그 검색..."
                            className="pl-9 glass"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <Button variant="ghost" onClick={handleDeleteAll} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                        전체 삭제
                    </Button>
                    {/* Filter Popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={`glass gap-2 ${selectedRegions.length > 0 || selectedTags.length > 0 || paymentFilter !== 'all' || birthdayFilter !== 'all' || cohortRange[0] !== 1 || cohortRange[1] !== 60 ? 'border-primary text-primary bg-primary/5' : ''}`}>
                                <Filter className="w-4 h-4" />
                                필터
                                {(selectedRegions.length > 0 || selectedTags.length > 0 || paymentFilter !== 'all' || birthdayFilter !== 'all' || cohortRange[0] !== 1 || cohortRange[1] !== 60) && <Badge variant="secondary" className="ml-1 h-5 px-1 bg-primary text-white">ON</Badge>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-background border border-border shadow-lg p-4" align="end">
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold leading-none flex items-center gap-2"><Filter className="w-3.5 h-3.5" /> 상세 필터</h4>
                                    <Button variant="ghost" size="sm" onClick={resetFilters} className="h-auto p-0 text-xs text-muted-foreground hover:text-red-500 transition-colors">
                                        초기화
                                    </Button>
                                </div>
                                <Separator />
                                {/* Status Filters */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">납부 상태</Label>
                                        <Select value={paymentFilter} onValueChange={(v: any) => setPaymentFilter(v)}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="전체" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">전체</SelectItem>
                                                <SelectItem value="paid">납부 완료</SelectItem>
                                                <SelectItem value="unpaid">미납</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">생일</Label>
                                        <Select value={birthdayFilter} onValueChange={(v: any) => setBirthdayFilter(v)}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="전체" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">전체</SelectItem>
                                                <SelectItem value="today">오늘</SelectItem>
                                                <SelectItem value="month">이번 달</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Separator />
                                {/* Cohort Filter */}
                                <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-muted-foreground flex justify-between">
                                        <span>기수 범위</span>
                                        <span className="text-primary font-bold">{cohortRange[0]}회 ~ {cohortRange[1]}회</span>
                                    </h5>
                                    <Slider
                                        defaultValue={[1, 60]}
                                        value={cohortRange}
                                        min={1}
                                        max={60}
                                        step={1}
                                        onValueChange={setCohortRange}
                                        className="py-2"
                                    />
                                </div>
                                <Separator />
                                {/* Region Filter */}
                                <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-muted-foreground">활동 지역 ({selectedRegions.length > 0 ? selectedRegions.length : '전체'})</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        {uniqueRegions.map(region => (
                                            <div key={region} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`filter-${region}`}
                                                    checked={selectedRegions.includes(region)}
                                                    onCheckedChange={() => toggleRegion(region)}
                                                />
                                                <Label htmlFor={`filter-${region}`} className="text-sm cursor-pointer hover:text-primary transition-colors">{region}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                {/* Tags Filter */}
                                <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-muted-foreground">관심 태그 ({selectedTags.length > 0 ? selectedTags.length : '전체'})</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {uniqueTags.map(tag => (
                                            <div key={tag}
                                                className={`cursor-pointer px-2 py-1 rounded-md text-xs border transition-colors ${selectedTags.includes(tag) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/80 border-transparent'}`}
                                                onClick={() => toggleTag(tag)}
                                            >
                                                #{tag}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Registration/Edit Dialog */}
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        if (!open) {
                            setEditingId(null)
                            setFormData({
                                name: '', cohort: '', region: '서울 강남', job: '', company: '',
                                email: '', phone: '', introduction: '', tags: ''
                            })
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 gap-2">
                                <Plus className="w-4 h-4" /> 동문 등록
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-background border-border shadow-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingId ? '동문 정보 수정' : '새로운 동문 등록'}</DialogTitle>
                                <DialogDescription>
                                    {editingId ? '정보를 수정하면 즉시 반영됩니다.' : '모든 정보를 상세히 입력해주시면 다른 동문들이 더 쉽게 찾을 수 있습니다.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">이름 <span className="text-red-500">*</span></Label>
                                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="col-span-3" placeholder="홍길동" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="cohort" className="text-right">기수 <span className="text-red-500">*</span></Label>
                                    <Input id="cohort" type="number" value={formData.cohort} onChange={(e) => setFormData({ ...formData, cohort: e.target.value })} className="col-span-3" placeholder="30" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">이메일</Label>
                                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="col-span-3" placeholder="example@salesio.com" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phone" className="text-right">전화번호</Label>
                                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="col-span-3" placeholder="010-1234-5678" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="region" className="text-right">지역</Label>
                                    <Select value={formData.region} onValueChange={(v) => setFormData({ ...formData, region: v })}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="지역 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="서울 강남">서울 강남</SelectItem>
                                            <SelectItem value="서울 서초">서울 서초</SelectItem>
                                            <SelectItem value="경기 분당">경기 분당</SelectItem>
                                            <SelectItem value="부산 해운대">부산 해운대</SelectItem>
                                            <SelectItem value="해외">해외</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="job" className="text-right">직업</Label>
                                    <Input id="job" value={formData.job} onChange={(e) => setFormData({ ...formData, job: e.target.value })} className="col-span-3" placeholder="개발자" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="company" className="text-right">소속</Label>
                                    <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="col-span-3" placeholder="삼성전자" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="tags" className="text-right">태그</Label>
                                    <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="col-span-3" placeholder="IT, 스타트업 (쉼표 구분)" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="introduction" className="text-right">자기소개</Label>
                                    <textarea
                                        id="introduction"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                                        value={formData.introduction}
                                        onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                                        placeholder="간단한 자기소개를 입력해주세요."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" onClick={handleSubmit}>{editingId ? '수정 완료' : '등록하기'}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="이름, 기수, 직업, 태그로 검색..."
                    className="pl-10 h-10 w-full md:w-[400px] glass bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedAlumnae.map((person) => (
                    <Card key={person.id} className="glass group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                    <AvatarFallback className="bg-gradient-to-br from-pink-100 to-purple-100 text-primary font-bold">
                                        {person.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <Badge variant="secondary" className="glass bg-primary/5 text-primary">
                                    {person.cohort}회
                                </Badge>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-lg">{person.name}</h3>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    <span className="truncate max-w-[80px]">{person.job}</span>
                                    <span className="text-[10px] opacity-50">|</span>
                                    <span className="truncate max-w-[80px]">{person.company}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{person.region}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {person.tags.map((tag: string) => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/50">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-border/30 flex gap-2">
                                <Button className="w-full text-xs h-8" variant="outline" onClick={() => setSelectedAlumna(person)}>프로필 보기</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {paginatedAlumnae.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
                <div className="flex items-center justify-center gap-2 py-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        title="첫 페이지"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        title="이전 페이지"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="text-sm font-medium min-w-[3rem] text-center">
                        {currentPage} / {totalPages}
                    </span>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        title="다음 페이지"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        title="마지막 페이지"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Profile Detail Sheet */}
            <Sheet open={!!selectedAlumna} onOpenChange={(open) => !open && setSelectedAlumna(null)}>
                <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-background border-l border-border shadow-xl">
                    {selectedAlumna && (
                        <div className="relative h-full flex flex-col">
                            {/* Decorative Header */}
                            <div className="h-32 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 opacity-90 relative">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
                            </div>

                            <div className="px-6 flex-1 flex flex-col">
                                {/* Profile Header */}
                                <div className="relative -mt-12 mb-6 flex justify-between items-end">
                                    <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-primary/10">
                                        <AvatarFallback className="text-3xl bg-gradient-to-br from-white to-pink-50 text-primary font-bold">
                                            {selectedAlumna.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="mb-1 text-right">
                                        <Badge variant="secondary" className="text-sm px-3 py-1 shadow-sm bg-background/80 backdrop-blur-md border-primary/20 text-primary">
                                            {selectedAlumna.cohort}회 졸업생
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                        {selectedAlumna.name}
                                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                            {selectedAlumna.id <= 6 ? '정회원' : '신규회원'}
                                        </span>
                                    </h2>
                                    <p className="text-sm font-medium text-primary/80">{selectedAlumna.company} @ {selectedAlumna.job}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <MapPin className="w-3 h-3" /> {selectedAlumna.region}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {selectedAlumna.tags.map((tag: string) => (
                                        <Badge key={tag} variant="outline" className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>

                                <Separator className="mb-6 opacity-50" />

                                {/* Detailed Info */}
                                <div className="space-y-6 flex-1">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5" /> Contact Info
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Email</span>
                                                    <span className="text-sm font-medium">{selectedAlumna.email}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Phone</span>
                                                    <span className="text-sm font-medium">{selectedAlumna.phone}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors">
                                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <Hash className="w-3.5 h-3.5" /> Introduction
                                            </h3>
                                            <p className="text-sm leading-relaxed text-foreground/90">
                                                {selectedAlumna.introduction}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-8 mb-6 grid grid-cols-2 gap-3">
                                    <Button className="w-full" variant="outline" onClick={() => handleEdit(selectedAlumna)}>
                                        <Briefcase className="w-4 h-4 mr-2" /> 정보 수정
                                    </Button>
                                    <Button className="w-full hover:bg-destructive hover:text-destructive-foreground" variant="outline" onClick={() => handleDelete(selectedAlumna.id)}>
                                        <div className="flex items-center text-destructive hover:text-destructive-foreground">
                                            <span className="mr-2">🗑️</span> 동문 삭제
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
