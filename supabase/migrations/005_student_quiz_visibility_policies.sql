drop policy if exists "students read pack quizzes" on public.quizzes;
create policy "students read pack quizzes"
on public.quizzes
for select
using (
  is_published = true
  and public.has_active_pack(pack_id)
  and (
    subject_id is null
    or exists (
      select 1
      from public.subjects s
      where s.id = subject_id
        and coalesce(s.is_visible, true) = true
    )
  )
);

drop policy if exists "students read quiz questions" on public.questions;
create policy "students read quiz questions"
on public.questions
for select
using (
  exists (
    select 1
    from public.quizzes q
    left join public.subjects s on s.id = q.subject_id
    where q.id = questions.quiz_id
      and q.is_published = true
      and public.has_active_pack(q.pack_id)
      and coalesce(s.is_visible, true) = true
  )
);

drop policy if exists "students read quiz answers" on public.answers;
create policy "students read quiz answers"
on public.answers
for select
using (
  exists (
    select 1
    from public.questions qu
    join public.quizzes q on q.id = qu.quiz_id
    left join public.subjects s on s.id = q.subject_id
    where qu.id = answers.question_id
      and q.is_published = true
      and public.has_active_pack(q.pack_id)
      and coalesce(s.is_visible, true) = true
  )
);
