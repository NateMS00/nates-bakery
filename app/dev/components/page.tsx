"use client";

import { BakeTile } from "@/components/ui/BakeTile";
import { BakeProgress } from "@/components/ui/BakeProgress";
import { CheckRow } from "@/components/ui/CheckRow";
import { CoverPicture } from "@/components/ui/CoverPicture";
import { PictureButton } from "@/components/ui/PictureButton";
import { PictureChip } from "@/components/ui/PictureChip";
import { RecipeTile } from "@/components/ui/RecipeTile";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { SourceCard } from "@/components/ui/SourceCard";
import { TabBar } from "@/components/ui/TabBar";
import { TimerChip } from "@/components/ui/TimerChip";
import { ViewTabs } from "@/components/ui/ViewTab";
import { Cake, ChevronLeft, Heart, Import, LibraryBig, Settings, Share } from "lucide-react";

// Stage B scaffold (visual-round): every new presentational component from SKIN.md,
// for Nathan's review before any real screen uses them. Unlinked from navigation and
// outside proxy.ts's matcher (no auth). DELETE once Stage C's screens render these for
// real — this page is scaffolding, not a feature.

function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-sm">
      <h2 className="type-heading text-ink">{label}</h2>
      {children}
    </section>
  );
}

export default function ComponentShowcasePage() {
  return (
    <main className="mx-auto w-full max-w-[calc(var(--spacing-content-max)+2*var(--gutter))] px-(--gutter) py-xl">
      <h1 className="type-display-md text-ink">Component showcase (visual round, Stage B)</h1>
      <p className="mt-xs type-body-sm text-muted">Presentational only — no screen wires these up yet.</p>

      <div className="mt-xl flex flex-col gap-2xl">
        <Demo label="recipe-tile">
          <div className="grid grid-cols-2 gap-x-md gap-y-base tablet:grid-cols-3 desktop:grid-cols-4">
            <RecipeTile href="#" picture="/recipe-pictures/custard-tart.svg" category="Pastry" title="Pastéis de nata" rating={4} favorite={true} bakedLabel="Baked 13 Oct" />
            <RecipeTile href="#" picture="/recipe-pictures/chocolate.svg" category="Cookie/bar" title="Fudgy brownies" rating={5} favorite={false} bakedLabel="Baked 1 Sep" />
            <RecipeTile href="#" picture={null} category="Bread" title="Pillowy pita" rating={null} favorite={false} bakedLabel={null} />
            <RecipeTile href="#" picture="/recipe-pictures/pale-meringue.svg" category="Cake" title="Lemon drizzle loaf with a long enough title to wrap twice" rating={null} favorite={true} bakedLabel={null} disabled />
          </div>
        </Demo>

        <Demo label="bake-tile">
          <div className="grid grid-cols-2 gap-x-md gap-y-base tablet:grid-cols-3 desktop:grid-cols-4">
            <BakeTile href="#" picture="/recipe-pictures/custard-tart.svg" day="15" weekday="Thu" title="Pastéis de nata" rating={5} bakeLabel="2nd bake" />
            <BakeTile href="#" picture="/recipe-pictures/chocolate.svg" day="2" weekday="Fri" title="Fudgy brownies" rating={3} bakeLabel="1.5×" />
            <BakeTile href="#" picture="/recipe-pictures/berry.svg" day="28" weekday="Mon" title="Burnt Basque cheesecake" rating={null} bakeLabel={null} />
            <BakeTile href="#" picture="/recipe-pictures/pale-meringue.svg" day="5" weekday="Sat" title="Lemon drizzle loaf" rating={4} bakeLabel="1.5×" disabled />
          </div>
        </Demo>

        <Demo label="check-row">
          <div className="max-w-[480px]">
            <CheckRow name="Caster sugar" original="from 1¼ cups" amount="250 g" status="converted" confirmed={false} onJump={() => {}} onConfirm={() => {}} />
            <CheckRow name="Plain flour" original="from 1 cup" amount="125 g" status="converted" confirmed={true} onJump={() => {}} onConfirm={() => {}} />
            <CheckRow name="Egg yolks" original="from 6 eggs" amount="108 g" status="estimated" confirmed={false} onJump={() => {}} onConfirm={() => {}} />
            <CheckRow name="Butter" original="" amount="— g" status="missing" confirmed={false} onJump={() => {}} />
          </div>
        </Demo>

        <Demo label="source-card">
          <div className="max-w-[480px]">
            <SourceCard reelImage="/recipe-pictures/custard-tart.svg" reelUrl="#" handle="forno.da.rita" captionPreview="Pastéis de nata, the Lisbon way. Flaky layers, a custard that still wobbles. Recipe below!" />
          </div>
        </Demo>

        <Demo label="picture-button">
          <div className="flex gap-sm">
            <PictureButton label="Back to Library">
              <ChevronLeft aria-hidden="true" strokeWidth={2.2} />
            </PictureButton>
            <PictureButton label="Favorite" aria-pressed="true" className="text-primary">
              <Heart aria-hidden="true" fill="currentColor" strokeWidth={1.8} />
            </PictureButton>
            <PictureButton label="Share" disabled>
              <Share aria-hidden="true" strokeWidth={1.8} />
            </PictureButton>
          </div>
        </Demo>

        <Demo label="picture-chip">
          <div className="relative h-[80px] w-[120px] rounded-lg bg-surface-sunken">
            <PictureChip className="absolute top-sm left-sm flex flex-col items-center leading-none">
              <span>15</span>
              <span className="font-normal">Thu</span>
            </PictureChip>
          </div>
        </Demo>

        <Demo label="cover-picture">
          <div className="max-w-[480px]">
            <CoverPicture src="/recipe-pictures/custard-tart.svg" favorite={true} />
          </div>
        </Demo>

        <Demo label="view-tab">
          <ViewTabs label="Library views" value="recipes" onChange={() => {}} options={[{ value: "recipes", label: "Recipes" }, { value: "favorites", label: "Favorites" }, { value: "drafts", label: "Drafts", count: 2 }]} />
        </Demo>

        <Demo label="section-tabs">
          <SectionTabs current="#ingredients" options={[{ href: "#ingredients", label: "Ingredients" }, { href: "#steps", label: "Steps" }, { href: "#bakes", label: "Bakes 3" }]} />
        </Demo>

        <Demo label="tab-bar">
          <div className="max-w-[480px] overflow-hidden rounded-lg border border-hairline">
            <TabBar
              items={[
                { href: "#", label: "Library", icon: <LibraryBig aria-hidden="true" strokeWidth={1.8} />, current: true },
                { href: "#", label: "Import", icon: <Import aria-hidden="true" strokeWidth={1.8} /> },
                { href: "#", label: "Bakes", icon: <Cake aria-hidden="true" strokeWidth={1.8} /> },
                { href: "#", label: "Account", icon: <Settings aria-hidden="true" strokeWidth={1.8} /> },
              ]}
            />
          </div>
        </Demo>

        <Demo label="bake-progress">
          <div className="flex flex-col gap-lg">
            <BakeProgress groups={[{ name: "Base", steps: 3 }, { name: "Filling", steps: 3 }, { name: "Baking", steps: 2 }]} current={4} />
            <BakeProgress groups={[{ name: "Steps", steps: 6 }]} current={2} />
          </div>
        </Demo>

        <Demo label="timer-chip">
          <p className="max-w-[420px] type-step-text text-ink">
            Cover and rest for <TimerChip label="15 min" running={false} onStart={() => {}} />, then roll and rest for <TimerChip label="2 hours" running={true} remaining="9:42" />.
          </p>
        </Demo>
      </div>
    </main>
  );
}
