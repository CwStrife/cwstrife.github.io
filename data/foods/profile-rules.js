window.FOOD_PROFILE_RULES = {
  specialCases: {
    "green-mandarin": {
      preferredProducts:["general-live-copepods","reef-nutrition-roe","reef-nutrition-tdo-xsmall","lrs-reef-frenzy-nano"],
      avoidTypes:["flake"],
      strategy:"Mature pod-rich systems matter most. Packaged foods here should be treated as support or transition foods, not a full replacement for a live pod population.",
      feedingSchedule:"Small grazing opportunities throughout the day work better than one heavy dump feeding.",
      forceFamily:"pod-picker"
    },
    "mandarin-dragonet": {
      preferredProducts:["general-live-copepods","reef-nutrition-roe","reef-nutrition-tdo-xsmall","lrs-reef-frenzy-nano"],
      avoidTypes:["flake"],
      strategy:"Mature pod-rich systems matter most. Packaged foods here should be treated as support or transition foods, not a full replacement for a live pod population.",
      feedingSchedule:"Small grazing opportunities throughout the day work better than one heavy dump feeding.",
      forceFamily:"pod-picker"
    },
    "spotted-mandarin": {
      preferredProducts:["general-live-copepods","reef-nutrition-roe","reef-nutrition-tdo-xsmall","lrs-reef-frenzy-nano"],
      avoidTypes:["flake"],
      strategy:"Mature pod-rich systems matter most. Packaged foods here should be treated as support or transition foods, not a full replacement for a live pod population.",
      feedingSchedule:"Small grazing opportunities throughout the day work better than one heavy dump feeding.",
      forceFamily:"pod-picker"
    },
    "harlequin-shrimp": {
      preferredProducts:[],
      allowCatalog:false,
      strategy:"This is a specialist starfish eater. Normal packaged foods should not be shown as if they solve the husbandry requirement.",
      feedingSchedule:"Only sell with a real plan for starfish feeding and long-term care.",
      forceFamily:"specialist-only"
    }
  },
  groupRules: [
    {
      id:"pod-picker",
      nameRegex:/(mandarin|dragonet|scooter)/i,
      preferredProducts:["general-live-copepods","reef-nutrition-roe","reef-nutrition-tdo-xsmall","lrs-reef-frenzy-nano"],
      avoidTypes:["flake"],
      family:"pod-picker",
      strategy:"These fish spend much of the day hunting tiny prey. Mature rockwork and pod availability matter more than any single packaged food.",
      feedingSchedule:"Offer very small foods often and expect natural grazing between feedings."
    },
    {
      id:"anthias-planktivore",
      categoryRegex:/(Anthias|Cardinalfish|Damsels)/i,
      nameRegex:/(chromis|firefish|dartfish|anthias)/i,
      preferredProducts:["reef-nutrition-tdo-xsmall","reef-nutrition-tdo-small","reef-nutrition-roe","lrs-reef-frenzy-nano","sfbb-reef-plankton","hikari-marine-s"],
      family:"planktivore",
      strategy:"Small mouths and active metabolisms usually do best with finer foods and more frequent smaller meals.",
      feedingSchedule:"Feed lightly but more often than you would heavy-bodied grazers or ambush predators."
    },
    {
      id:"herbivore-grazer",
      categoryRegex:/(Tangs|Rabbitfish)/i,
      dietRegex:/(algae|seaweed|graze|herbiv)/i,
      preferredProducts:["lrs-premium-seaweed","ocean-nutrition-green-marine-algae","lrs-herbivore-frenzy","hikari-marine-herbivore","ocean-nutrition-formula-two-pellets","ocean-nutrition-formula-two-flakes","nls-algaemax"],
      family:"herbivore",
      strategy:"Keep algae and seaweed options available and rotate in prepared foods with real plant content.",
      feedingSchedule:"Several smaller grazing opportunities are better than one heavy all-meat feeding."
    },
    {
      id:"general-reef-omnivore",
      categoryRegex:/(Clownfish|Wrasses|Gobies|Basslets|Dottybacks|Angelfish|Butterflyfish|Hawkfish|Other Fish)/i,
      preferredProducts:["nls-marine-fish","ocean-nutrition-prime-reef","ocean-nutrition-formula-one-pellets","lrs-reef-frenzy","hikari-marine-s","sfbb-mysis"],
      family:"community",
      strategy:"A stable prepared-food routine usually works best here: one dependable staple plus a frozen rotation for variety.",
      feedingSchedule:"Mix a clean daily staple with a few frozen feedings each week."
    },
    {
      id:"predator-meaty",
      categoryRegex:/(Triggerfish|Puffers|Lionfish|Eels)/i,
      dietRegex:/(meaty|crustaceans|fish|predat|carniv)/i,
      preferredProducts:["pe-mysis","hikari-mysis","sfbb-mysis","lrs-reef-frenzy","pe-pellets","ocean-nutrition-formula-one-pellets"],
      avoidTypes:["sheet"],
      family:"predator",
      strategy:"Focus on meaty foods sized to the mouth. Avoid overfeeding large predators just because they act hungry.",
      feedingSchedule:"Offer firm meaty foods in portions the animal can actually finish cleanly."
    },
    {
      id:"filter-feeder",
      categoryRegex:/(Clams|Anemones|Starfish|Urchins|Inverts|Shrimp|Crabs|Snails)/i,
      dietRegex:/(filter|phytoplankton|detritus|scavenger|algae)/i,
      preferredProducts:["reef-nutrition-phyto-feast","reef-nutrition-oyster-feast","reef-nutrition-roe","ocean-nutrition-green-marine-algae","lrs-premium-seaweed"],
      family:"invert-support",
      strategy:"Some invertebrates rely more on mature systems, natural films, or target feeding than on generic fish foods. Show packaged foods only when they genuinely fit the animal.",
      feedingSchedule:"Use targeted feeding only when the species actually benefits from it."
    }
  ]
};
