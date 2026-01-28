
-- 1. 기존의 잘못된/제한적인 정책들을 모두 삭제합니다.
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder mebl5r_0" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder mebl5r_1" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder mebl5r_2" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder mebl5r_3" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- 2. "alumnae-photos" 버킷에 대해 '누구나(anon)' 모든 권한(SELECT, INSERT, UPDATE, DELETE)을 갖도록 설정합니다.
-- 아무런 폴더 제한이나 파일 확장자 제한을 두지 않습니다.
CREATE POLICY "Allow All Access to alumnae-photos"
ON storage.objects
FOR ALL
USING ( bucket_id = 'alumnae-photos' )
WITH CHECK ( bucket_id = 'alumnae-photos' );
