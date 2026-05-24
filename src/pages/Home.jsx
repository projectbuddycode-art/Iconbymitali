import React from "react";
import HeroSectionExact from "../components/home/HeroSectionExact";
import FeaturedCollectionsExact from "../components/home/FeaturedCollectionsExact";
import TimelessKnitwearExact from "../components/home/TimelessKnitwearExact";
import DesignedWithIntentionExact from "../components/home/DesignedWithIntentionExact";
import MeetTheFounderExact from "../components/home/MeetTheFounderExact";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSectionExact />
      <FeaturedCollectionsExact />
      <TimelessKnitwearExact />
      <DesignedWithIntentionExact />
      <MeetTheFounderExact />
    </div>
  );
}