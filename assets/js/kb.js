/* ============================================================
   Local Knowledge Base — powers everything when offline.
   Each topic: id, title, category, emoji, tags, summary,
   sections [{h, p}], facts [{k,v}], related [ids], trending?
   ============================================================ */
"use strict";

const KB_TOPICS = [
{
  id: "artificial-intelligence",
  title: "Artificial Intelligence",
  category: "Technology",
  emoji: "🤖",
  tags: ["ai", "artificial intelligence", "machine intelligence", "neural networks", "llm", "chatgpt", "genspark", "agents", "ai agents"],
  summary: "Artificial intelligence (AI) is the capability of computational systems to perform tasks typically associated with human intelligence, such as learning, reasoning, problem-solving, perception, and decision-making. Modern AI is dominated by machine learning, where statistical models improve at tasks through exposure to data rather than explicit programming.",
  sections: [
    { h: "What is AI?", p: "Artificial intelligence is a field of computer science focused on building systems that can perform tasks requiring human-like intelligence: understanding language, recognizing images, planning, and making decisions. The field was formally founded at the Dartmouth workshop in 1956, where researchers predicted machines would match human intelligence within a generation — a goal that proved far harder than expected. Today AI is a broad umbrella covering search algorithms, expert systems, machine learning, and robotics." },
    { h: "How modern AI works", p: "Most modern AI is machine learning: models adjust millions or billions of internal parameters to minimize error on training data. Deep learning uses artificial neural networks with many layers, loosely inspired by the brain, to learn hierarchical patterns — pixels become edges, edges become shapes, shapes become objects. Transformer architectures, introduced in 2017, revolutionized language modeling and power large language models (LLMs) such as GPT, Claude, and Gemini, which predict the next token in a sequence yet emerge with striking reasoning abilities." },
    { h: "Applications", p: "AI now powers search engines, recommendation systems, voice assistants, medical imaging, drug discovery, code generation, autonomous vehicles, and fraud detection. Agentic AI systems — like Genspark's agentic framework that this app clones — chain reasoning steps, call tools, and synthesize 'Sparkpages' on the fly. Generative AI creates text, images, audio, and video from prompts, reshaping creative industries and software development." },
    { h: "Risks and debates", p: "Key concerns include bias in training data, hallucination of false facts, job displacement, deepfakes, concentration of power, and long-term questions about superintelligence. Governments are responding with regulation such as the EU AI Act, while researchers work on alignment — ensuring AI systems reliably pursue intended goals. The debate between acceleration and caution remains one of the defining technology discussions of the decade." }
  ],
  facts: [
    { k: "Field founded", v: "1956 (Dartmouth workshop)" },
    { k: "Core technique", v: "Machine learning / deep learning" },
    { k: "Key breakthrough", v: "Transformers (2017)" },
    { k: "Major milestone", v: "AlphaGo beats Lee Sedol (2016)" },
    { k: "GenAI boom", v: "ChatGPT launch (Nov 2022)" }
  ],
  related: ["machine-learning", "quantum-computing", "robotics", "semiconductors"],
  trending: 1
},
{
  id: "quantum-computing",
  title: "Quantum Computing",
  category: "Technology",
  emoji: "⚛️",
  tags: ["quantum", "quantum computing", "qubit", "qubits", "superposition", "entanglement", "ibm quantum", "google quantum"],
  summary: "Quantum computing exploits quantum-mechanical phenomena — superposition and entanglement — to process information in ways classical computers cannot. While still experimental, quantum computers promise breakthroughs in cryptography, materials science, and optimization.",
  sections: [
    { h: "The core idea", p: "A classical bit is either 0 or 1. A quantum bit (qubit) can exist in a superposition of both states until measured, and multiple qubits can be entangled so their states correlate in ways impossible classically. Quantum algorithms choreograph interference between these amplitude states so that wrong answers cancel out and correct answers amplify. This doesn't make quantum computers universally faster — it makes them dramatically faster for specific problem classes." },
    { h: "What they're good for", p: "Shor's algorithm (1994) showed a large quantum computer could factor big numbers exponentially faster than known classical methods, threatening RSA encryption. Grover's algorithm offers quadratic speedups for search. The most anticipated near-term use is simulating molecules and materials, since nature itself is quantum mechanical — with applications in battery chemistry, catalysts, fertilizers, and drug design." },
    { h: "Hardware approaches", p: "Leading qubit technologies include superconducting circuits (IBM, Google), trapped ions (IonQ, Quantinuum), photonics (PsiQuantum), neutral atoms (QuEra), and topological qubits (Microsoft). All battle decoherence — qubits losing their quantum state through environmental noise. Google announced quantum supremacy in 2019 when its Sycamore chip performed a sampling task in 200 seconds estimated to take supercomputers 10,000 years (a claim IBM disputed)." },
    { h: "Where the field stands", p: "Current devices have hundreds to ~1,000+ physical qubits but high error rates, so the field pursues quantum error correction: encoding one reliable 'logical' qubit into many physical ones. Google's Willow chip (2024) demonstrated below-threshold error correction. Useful fault-tolerant machines are generally expected in the 2030s. Meanwhile, post-quantum cryptography standards (NIST, 2024) are already being deployed to protect data harvested today." }
  ],
  facts: [
    { k: "Basic unit", v: "Qubit" },
    { k: "Key phenomena", v: "Superposition & entanglement" },
    { k: "Famous algorithm", v: "Shor's (factoring, 1994)" },
    { k: "Supremacy claim", v: "Google Sycamore (2019)" },
    { k: "Biggest challenge", v: "Decoherence / error correction" }
  ],
  related: ["artificial-intelligence", "semiconductors", "black-holes"],
  trending: 2
},
{
  id: "climate-change",
  title: "Climate Change",
  category: "Science",
  emoji: "🌍",
  tags: ["climate", "climate change", "global warming", "greenhouse", "carbon", "emissions", "paris agreement", "co2"],
  summary: "Climate change refers to long-term shifts in global temperatures and weather patterns, driven since the industrial era primarily by human greenhouse gas emissions. Earth's average surface temperature has risen about 1.2–1.3°C since pre-industrial times, intensifying heatwaves, sea-level rise, and extreme weather.",
  sections: [
    { h: "Causes", p: "The greenhouse effect is natural: gases like CO₂, methane, and water vapor trap heat and keep Earth habitable. Since the Industrial Revolution, burning coal, oil, and gas has raised atmospheric CO₂ from ~280 ppm to over 420 ppm — levels unseen in at least 3 million years. Deforestation and agriculture add further emissions. Multiple independent lines of evidence — from satellite measurements to the isotopic fingerprint of carbon — attribute the observed warming overwhelmingly to human activity." },
    { h: "Observed impacts", p: "Global average temperature has risen roughly 1.2–1.3°C above pre-industrial levels, with 2023 and 2024 the hottest years on record. Consequences include shrinking glaciers and ice sheets, ~20 cm of sea-level rise since 1900 and accelerating, ocean warming and acidification, more intense heatwaves and heavy rainfall events, longer wildfire seasons, and shifting ecosystems. Coral reefs face repeated mass bleaching events." },
    { h: "Responses and solutions", p: "The 2015 Paris Agreement commits nearly every nation to hold warming 'well below 2°C' and pursue 1.5°C. Decarbonization pathways center on renewable energy (solar and wind are now the cheapest new electricity in most regions), electrification of transport and heating, efficiency, halting deforestation, and developing carbon capture and green hydrogen. Adaptation — sea walls, heat plans, resilient crops — runs in parallel." },
    { h: "Outlook", p: "Current policies put the world on track for roughly 2.5–3°C of warming by 2100; meeting 1.5°C requires emissions to fall ~43% by 2030 and reach net zero around 2050. Every fraction of a degree matters: the difference between 1.5°C and 2°C means substantially more extreme heat, species loss, and sea-level rise. Momentum is growing — clean energy investment now exceeds fossil fuel investment — but the pace remains the central question." }
  ],
  facts: [
    { k: "Warming so far", v: "~1.2–1.3°C since 1850" },
    { k: "Atmospheric CO₂", v: ">420 ppm (2024)" },
    { k: "Sea-level rise", v: "~20+ cm since 1900" },
    { k: "Key accord", v: "Paris Agreement (2015)" },
    { k: "Net-zero target", v: "~2050 for 1.5°C" }
  ],
  related: ["renewable-energy", "electric-vehicles", "oceans"],
  trending: 3
},
{
  id: "mars-exploration",
  title: "Mars Exploration",
  category: "Space",
  emoji: "🔴",
  tags: ["mars", "red planet", "nasa mars", "perseverance", "curiosity", "spacex mars", "mars rover", "starship"],
  summary: "Mars exploration encompasses robotic missions and planned human expeditions to the Red Planet. NASA's rovers have confirmed Mars once hosted liquid water and habitable environments, and the first human missions are targeted for the 2030s–2040s.",
  sections: [
    { h: "Why Mars?", p: "Mars is the most Earth-like planet in the solar system: a day of similar length, polar ice, seasons, and strong evidence it once had rivers, lakes, and possibly oceans. It is the most plausible place to find past (or present) extraterrestrial life, and the nearest candidate for human settlement. Ares Vallis, Jezero Crater, and Gale Crater preserve records of ancient wet epochs." },
    { h: "Key missions", p: "Mariner 4 returned the first close-up images in 1965; Viking 1 made the first successful landing in 1976. Modern highlights: Spirit and Opportunity (2004), Curiosity (2012, still operating), Perseverance (2021) which is caching samples for return, and Ingenuity — the helicopter that flew 72 times in Mars's thin air. China's Zhurong rover landed in 2021, and the UAE's Hope orbiter studies the atmosphere." },
    { h: "Big discoveries", p: "Orbiters mapped ancient river deltas and minerals that form only in water. Curiosity found organic molecules and methane fluctuations in Gale Crater. Radar revealed subsurface ice at mid-latitudes — critical for future crews. Perseverance is collecting cores that the Mars Sample Return campaign aims to bring to Earth for analysis far beyond rover instruments." },
    { h: "The road to humans", p: "SpaceX's Starship is designed around Mars transport, with uncrewed cargo flights proposed as early pathfinders; NASA targets crewed missions in the late 2030s–2040s using the Moon as a proving ground via Artemis. Major hurdles: radiation exposure over the ~6–9 month transit, entry-descent-landing of heavy payloads, life support closure, and producing return propellant from Martian air and ice (ISRU)." }
  ],
  facts: [
    { k: "Day length", v: "24h 37m (a 'sol')" },
    { k: "Active rovers", v: "Curiosity, Perseverance" },
    { k: "First flight", v: "Ingenuity (2021), 72 flights" },
    { k: "Highest peak", v: "Olympus Mons, ~22 km" },
    { k: "Travel time", v: "~6–9 months" }
  ],
  related: ["iss", "james-webb", "black-holes"],
  trending: 4
},
{
  id: "black-holes",
  title: "Black Holes",
  category: "Space",
  emoji: "🕳️",
  tags: ["black hole", "black holes", "event horizon", "singularity", "sagittarius a", "gravity", "spacetime", "event horizon telescope"],
  summary: "Black holes are regions of spacetime where gravity is so intense that nothing — not even light — can escape. They range from stellar-mass objects to supermassive giants anchoring galaxies, and were directly imaged for the first time in 2019.",
  sections: [
    { h: "What is a black hole?", p: "When a massive star exhausts its fuel, its core can collapse under gravity until its escape velocity exceeds the speed of light. The boundary of no return is the event horizon; at the center, general relativity predicts a singularity of infinite density. Einstein's field equations implied their existence (Schwarzschild, 1916), and the term 'black hole' was popularized by John Wheeler in 1967." },
    { h: "Types and formation", p: "Stellar-mass black holes (5–100 solar masses) form from collapsing stars; millions likely populate the Milky Way. Supermassive black holes (millions to billions of solar masses) sit at galactic centers — Sagittarius A* anchors ours — though how they grew so large so early remains debated. Intermediate-mass and primordial black holes fill the gaps in theory, increasingly supported by gravitational-wave detections of unusual mergers." },
    { h: "How we observe them", p: "Black holes betray themselves through hot, glowing accretion disks, jets of relativistic plasma, and the orbits of nearby matter. LIGO's 2015 detection of gravitational waves from merging black holes opened a new astronomy. The Event Horizon Telescope — a planet-scale radio array — captured the first silhouette image (M87*) in 2019, then Sagittarius A* in 2022, matching Einstein's predictions." },
    { h: "Open mysteries", p: "Hawking showed black holes slowly evaporate via quantum radiation, creating the information paradox: does information falling in cease to exist, violating quantum mechanics? Proposals involving holography and quantum error correction suggest information escapes subtly. What happens at the singularity requires a theory of quantum gravity — one of physics' deepest unfinished quests." }
  ],
  facts: [
    { k: "Predicted by", v: "Einstein's relativity (1915–16)" },
    { k: "First photo", v: "M87* (EHT, 2019)" },
    { k: "Milky Way's SMBH", v: "Sagittarius A*, 4.3M ☉" },
    { k: "GW detection", v: "LIGO, Sept 2015" },
    { k: "Evaporation", v: "Hawking radiation (1974)" }
  ],
  related: ["james-webb", "quantum-computing", "mars-exploration"],
  trending: 5
},
{
  id: "electric-vehicles",
  title: "Electric Vehicles",
  category: "Technology",
  emoji: "🚗",
  tags: ["ev", "electric vehicle", "electric vehicles", "electric car", "electric cars", "tesla", "byd", "battery", "lithium", "charging"],
  summary: "Electric vehicles (EVs) use battery-stored electricity instead of internal combustion. Driven by falling battery costs and climate policy, EVs passed 17 million annual sales in 2024 — roughly one in five new cars worldwide.",
  sections: [
    { h: "How EVs work", p: "An EV replaces the engine, transmission, and fuel system with a battery pack, one or more electric motors, and power electronics. Lithium-ion cells (increasingly LFP chemistry, which avoids nickel and cobalt) store energy; motors deliver instant torque with over 90% drivetrain efficiency versus roughly 25–35% for gasoline. Regenerative braking recaptures energy, which is why EVs excel in city driving." },
    { h: "Rise of the EV market", p: "The modern era began with Tesla's Roadster (2008) and Nissan Leaf (2010). Falling battery prices — down ~90% since 2010 to around $115/kWh — made EVs viable at scale. China dominates, producing and buying over half the world's EVs, with BYD overtaking Tesla in quarterly sales. Norway leads per-capita, where EVs took ~90% of new car sales in 2024." },
    { h: "Charging and range", p: "Typical modern EVs offer 300–500 km of rated range. Home Level 2 charging adds ~40 km/hour; DC fast chargers (150–350 kW) add hundreds of kilometers in 15–30 minutes. Solid-state batteries promise denser, safer cells this decade, while 800-volt architectures and megawatt charging shrink refill times. Grid impacts are manageable with smart overnight charging, and EV batteries later serve as stationary storage." },
    { h: "Benefits and challenges", p: "EVs cut lifecycle emissions by roughly 50–70% on today's grids (more with renewables), eliminate tailpipe pollution, and cost less to fuel and maintain. Challenges include charging access for apartment dwellers, upfront price parity, battery raw-material supply chains, and recycling. Over 20 countries have announced dates to phase out new combustion-car sales, mostly between 2030 and 2040." }
  ],
  facts: [
    { k: "2024 sales", v: "~17 million (~20% share)" },
    { k: "Battery cost", v: "~$115/kWh (↓90% since 2010)" },
    { k: "Market leader", v: "China (>half of sales)" },
    { k: "Top chemistry", v: "LFP & NMC lithium-ion" },
    { k: "Efficiency", v: "~90% vs ~30% gas" }
  ],
  related: ["renewable-energy", "climate-change", "semiconductors"],
  trending: 6
},
{
  id: "blockchain",
  title: "Blockchain & Cryptocurrency",
  category: "Technology",
  emoji: "⛓️",
  tags: ["blockchain", "crypto", "cryptocurrency", "bitcoin", "ethereum", "web3", "smart contract", "defi", "nft"],
  summary: "Blockchain is a distributed ledger technology that records transactions in cryptographically linked blocks, enabling trustless digital money and programmable contracts. Bitcoin launched in 2009; the ecosystem has since grown into a multi-trillion-dollar asset class.",
  sections: [
    { h: "How blockchain works", p: "A blockchain is an append-only database replicated across thousands of computers. Transactions are batched into blocks, each referencing the previous block's cryptographic hash, making history tamper-evident. Consensus mechanisms let strangers agree on the ledger: proof-of-work (miners expend computation) secures Bitcoin, while proof-of-stake (validators lock up capital) secures Ethereum since its 2022 'Merge', cutting its energy use ~99.9%." },
    { h: "Bitcoin and crypto assets", p: "Bitcoin, created by the pseudonymous Satoshi Nakamoto in 2008–09, caps supply at 21 million coins and leads the market as 'digital gold'. Spot Bitcoin ETFs approved in the US in January 2024 brought institutional adoption. Thousands of other tokens exist; Ethereum pioneered smart contracts — code that executes on the chain — enabling decentralized finance (DeFi) and NFTs." },
    { h: "Beyond currency", p: "Enterprises use blockchains for supply-chain tracking, cross-border payments, tokenized securities, and digital identity. Stablecoins pegged to fiat currencies process trillions in annual settlement volume. Layer-2 networks batch transactions to cut fees, and central banks are piloting digital currencies (CBDCs) in over 100 countries." },
    { h: "Criticisms and risks", p: "The sector faces volatility, scams and exchange collapses (Mt. Gox 2014, FTX 2022), proof-of-work energy consumption, illicit-finance concerns, and regulatory uncertainty. Critics argue few applications need decentralized consensus; proponents counter that credible neutrality is precisely the point for money and public infrastructure. Regulation — MiCA in the EU, evolving US law — is rapidly professionalizing the industry." }
  ],
  facts: [
    { k: "First blockchain", v: "Bitcoin (2009, Satoshi)" },
    { k: "BTC supply cap", v: "21 million" },
    { k: "Smart contracts", v: "Ethereum (2015)" },
    { k: "Eth energy cut", v: "−99.9% after the Merge (2022)" },
    { k: "US spot ETFs", v: "Approved Jan 2024" }
  ],
  related: ["stock-market", "cybersecurity", "artificial-intelligence"],
  trending: 7
},
{
  id: "crispr-gene-editing",
  title: "CRISPR Gene Editing",
  category: "Science",
  emoji: "🧬",
  tags: ["crispr", "gene editing", "genetic engineering", "dna", "genome", "cas9", "biotech", "casgevy"],
  summary: "CRISPR is a gene-editing technology adapted from a bacterial immune system that lets scientists cut and modify DNA with unprecedented precision. Its developers won the 2020 Nobel Prize, and the first CRISPR medicine was approved in 2023.",
  sections: [
    { h: "The discovery", p: "CRISPR sequences were first noticed in bacterial DNA in the 1990s — repetitive spacers that turned out to be snippets of viral DNA, an immune 'memory'. In 2012, Jennifer Doudna and Emmanuelle Charpentier showed the Cas9 protein could be programmed with a guide RNA to cut any chosen DNA sequence, converting a microbial defense system into a universal editing tool. They received the 2020 Nobel Prize in Chemistry." },
    { h: "How editing works", p: "The guide RNA leads Cas9 to a matching DNA target; Cas9 cuts the double helix. Cells then repair the break — often imperfectly, disabling the gene (knockout), or using a supplied template to rewrite the sequence. Newer variants are more surgical: base editors chemically convert one DNA letter to another without cutting both strands, and prime editors can search-and-replace sequences with high precision." },
    { h: "Medicine arrives", p: "In December 2023, Casgevy became the first approved CRISPR therapy, curing sickle-cell disease and beta-thalassemia by reactivating fetal hemoglobin in patients' own stem cells. Trials are underway for inherited blindness, high cholesterol, cancer immunotherapy, and chronic infections. In agriculture, CRISPR crops — non-browning mushrooms, disease-resistant bananas, high-GABA tomatoes — are reaching markets." },
    { h: "Ethics and limits", p: "Challenges include off-target edits, delivering editors to the right tissues, and immune reactions to Cas9. The 2018 He Jiankui affair — edited embryos resulting in birth — provoked global condemnation and strict rules against heritable human editing. Somatic therapies that affect only the treated patient enjoy broad support; germline editing remains the field's red line." }
  ],
  facts: [
    { k: "Adapted from", v: "Bacterial immune system" },
    { k: "Key paper", v: "Doudna & Charpentier (2012)" },
    { k: "Nobel Prize", v: "Chemistry, 2020" },
    { k: "First drug", v: "Casgevy (2023)" },
    { k: "New tools", v: "Base & prime editing" }
  ],
  related: ["immune-system", "vaccines", "artificial-intelligence"],
  trending: 8
},
{
  id: "renewable-energy",
  title: "Renewable Energy",
  category: "Science",
  emoji: "🔆",
  tags: ["renewable energy", "renewables", "solar", "wind", "solar power", "wind power", "clean energy", "hydro", "geothermal", "energy transition"],
  summary: "Renewable energy comes from naturally replenished sources — sun, wind, water, geothermal heat. Solar is now the cheapest electricity source in history, and renewables supply over 30% of global electricity, a share rising quickly.",
  sections: [
    { h: "The main sources", p: "Solar photovoltaics convert sunlight directly to electricity and are the fastest-growing source ever deployed. Wind turbines — onshore and increasingly offshore — harness moving air. Hydropower, the largest renewable today, uses flowing water, with dams doubling as giant batteries. Geothermal taps Earth's heat (strong in Iceland, Kenya, Indonesia), and biomass and green hydrogen fill niches." },
    { h: "The economics flipped", p: "Solar module prices fell ~90% between 2010 and 2023 — following Wright's Law as cumulative production doubles. The IEA calls solar 'the cheapest electricity in history' in favorable regions. Renewables now attract more investment than fossil fuels, and in 2023 the world added ~50% more renewable capacity than the year before, led overwhelmingly by China. The COP28 summit agreed to triple renewable capacity by 2030." },
    { h: "The storage challenge", p: "Sun and wind are variable, so grids pair them with storage and flexibility. Lithium-ion battery costs fell ~90% in a decade, making grid-scale battery farms routine — California regularly meets evening peaks with batteries. Pumped hydro stores 90%+ of global storage energy. Complementary tools: interconnectors between regions, demand response, green hydrogen for industry, and next-gen geothermal." },
    { h: "Where the transition stands", p: "Renewables generate roughly a third of the world's electricity; some grids (Uruguay, Denmark, South Australia) run on wind and solar for most hours of the year. Fossil fuels still supply ~80% of total primary energy, so electrifying transport and heat plus clean power is the dual engine of decarbonization. The bottleneck is shifting from cost to permitting, grids, and supply chains." }
  ],
  facts: [
    { k: "Share of electricity", v: "~30%+ globally" },
    { k: "Cheapest source", v: "Solar PV (IEA)" },
    { k: "COP28 pledge", v: "Triple capacity by 2030" },
    { k: "Top storage", v: "Pumped hydro; batteries rising" },
    { k: "Leader", v: "China (majority of additions)" }
  ],
  related: ["climate-change", "electric-vehicles", "stock-market"],
  trending: 9
},
{
  id: "james-webb",
  title: "James Webb Space Telescope",
  category: "Space",
  emoji: "🔭",
  tags: ["james webb", "jwst", "webb telescope", "space telescope", "hubble successor", "infrared", "exoplanet", "early galaxies"],
  summary: "The James Webb Space Telescope (JWST) is the largest and most powerful space observatory ever built, peering in infrared light at the first galaxies, star-forming nebulae, and exoplanet atmospheres. It launched in December 2021 and began science in July 2022.",
  sections: [
    { h: "The mission", p: "A NASA–ESA–CSA collaboration costing ~$10 billion over 25 years of development, JWST succeeds Hubble. Its 6.5-meter gold-coated beryllium mirror — 18 hexagonal segments that unfolded in space — collects over six times Hubble's light. It orbits the Sun–Earth L2 point 1.5 million km away, shielded from the Sun by a tennis-court-sized, five-layer sunshield that keeps instruments below −223°C." },
    { h: "Why infrared?", p: "Light from the earliest galaxies is stretched by cosmic expansion into infrared wavelengths invisible to Hubble. Infrared also penetrates dust clouds where stars and planets form. Four instruments — NIRCam, NIRSpec, MIRI, and FGS/NIRISS — image and dissect light from targets, operating for a planned 5–10 years with fuel for 20+." },
    { h: "Major discoveries", p: "Webb revealed fully formed, unexpectedly bright galaxies just 300–400 million years after the Big Bang, forcing revisions to early-universe models. It detected water, carbon dioxide, methane and more in exoplanet atmospheres, imaged star birth in unprecedented detail (Pillars of Creation, Herbig-Haro jets), tracked water plumes on ocean moons, and studied supermassive black holes in the young cosmos." },
    { h: "Engineering marvels", p: "Launch on an Ariane 5 was so precise that saved fuel doubled the mission's expected life. The deployment sequence — 344 single points of failure — proceeded flawlessly over two weeks as the sunshield tensioned and mirrors unfolded. Alignment brought the 18 segments into focus to within a fraction of a wavelength; the first deep field image in July 2022 instantly became iconic." }
  ],
  facts: [
    { k: "Launched", v: "Dec 25, 2021 (Ariane 5)" },
    { k: "Mirror", v: "6.5 m, 18 gold segments" },
    { k: "Orbit", v: "Sun–Earth L2, 1.5M km away" },
    { k: "Vision", v: "Infrared (0.6–28 μm)" },
    { k: "Cost", v: "~$10 billion" }
  ],
  related: ["black-holes", "mars-exploration", "iss"],
  trending: 10
},
{
  id: "machine-learning",
  title: "Machine Learning",
  category: "Technology",
  emoji: "📈",
  tags: ["machine learning", "ml", "deep learning", "neural network", "supervised", "model", "training", "gradient descent"],
  summary: "Machine learning is the branch of AI where algorithms learn patterns from data to make predictions or decisions without explicit programming. It powers recommendation systems, fraud detection, translation, and the large language models behind modern chatbots.",
  sections: [
    { h: "Core paradigms", p: "Supervised learning trains models on labeled examples — spam/not-spam — to predict labels for new data. Unsupervised learning finds structure in unlabeled data, like clustering customers. Reinforcement learning trains agents through rewards, mastering games from Go to StarCraft. Self-supervised learning — predicting masked parts of text or images — unlocked today's giant pretrained models using the internet as a dataset." },
    { h: "How training works", p: "A model makes predictions, a loss function measures error, and gradient descent nudges millions of parameters to reduce it, iterating over data many times. Deep neural networks stack layers that learn increasingly abstract features. Success depends as much on data quality, evaluation, and deployment discipline as on architecture — the field known as MLOps." },
    { h: "Key milestones", p: "Perceptron (1957) → backpropagation popularized (1986) → deep learning's ImageNet breakthrough (AlexNet, 2012) → AlphaGo (2016) → the Transformer ('Attention Is All You Need', 2017) → GPT-3's in-context learning (2020) → ChatGPT and the generative era (2022). Each leap came from the combination of algorithms, data, and compute scaling together." },
    { h: "Practical concerns", p: "Models inherit biases in data and can fail silently on inputs unlike their training set (distribution shift). Engineers monitor accuracy, fairness, drift, and robustness; high-stakes uses demand human oversight. Techniques like fine-tuning, retrieval-augmentation, and RL from human feedback adapt foundation models to specific tasks and values." }
  ],
  facts: [
    { k: "Parent field", v: "Artificial intelligence" },
    { k: "Main types", v: "Supervised, unsupervised, RL" },
    { k: "Breakthrough", v: "AlexNet (2012)" },
    { k: "Key architecture", v: "Transformer (2017)" },
    { k: "Training engine", v: "Gradient descent + GPUs" }
  ],
  related: ["artificial-intelligence", "semiconductors", "quantum-computing"]
},
{
  id: "semiconductors",
  title: "Semiconductors & AI Chips",
  category: "Technology",
  emoji: "💾",
  tags: ["semiconductor", "semiconductors", "chip", "chips", "tsmc", "nvidia", "gpu", "intel", "transistor", "ai chips", "processor"],
  summary: "Semiconductors are the foundation of all modern electronics — silicon chips containing billions of transistors. The AI boom made advanced chips strategic assets: NVIDIA became one of the world's most valuable companies, and governments now treat chip capacity as national security.",
  sections: [
    { h: "How chips work", p: "Semiconductors like silicon conduct electricity controllably. Doped and patterned into transistors — microscopic switches — they form logic gates, and billions of gates form processors. Chipmaking (fabrication) prints features just nanometers wide using extreme-ultraviolet lithography: patterns smaller than a virus, etched layer by layer over months through hundreds of steps in fabs costing $20+ billion." },
    { h: "The AI chip boom", p: "Graphics processing units (GPUs), designed to render games by doing massive parallel math, turned out ideal for training neural networks. NVIDIA's bet on CUDA (2007) made its GPUs the default AI engine; its data-center revenue exploded after 2022, briefly making it the world's most valuable company. Custom AI accelerators followed: Google TPUs, AWS Trainium, and NPUs in every new phone and laptop." },
    { h: "Geopolitics of silicon", p: "Over 90% of cutting-edge logic chips are fabricated by TSMC in Taiwan — a concentration that alarms governments amid China–Taiwan tensions. The US CHIPS Act ($52B), EU Chips Act, and Japanese subsidies fund new fabs in Arizona, Dresden, and Kumamoto. Export controls restrict advanced AI chips and lithography equipment to China, which is investing heavily to localize production (SMIC's 7nm surprise)." },
    { h: "Beyond Moore's Law", p: "Transistor shrinks are slowing and costs rising, so progress shifts to chiplets (packaging multiple dies), 3D stacking, and specialized architectures. Photonics, analog AI, neuromorphic chips, and quantum computing explore post-CMOS futures. The industry passed $600 billion in annual revenue, with AI expected to push it toward $1 trillion by 2030." }
  ],
  facts: [
    { k: "Transistors/chip", v: ">100 billion (advanced)" },
    { k: "Top foundry", v: "TSMC (Taiwan, ~90% leading-edge)" },
    { k: "AI leader", v: "NVIDIA (data-center GPUs)" },
    { k: "Key tool", v: "EUV lithography (ASML)" },
    { k: "US policy", v: "CHIPS Act, $52B (2022)" }
  ],
  related: ["artificial-intelligence", "quantum-computing", "stock-market"]
},
{
  id: "robotics",
  title: "Robotics",
  category: "Technology",
  emoji: "🦾",
  tags: ["robot", "robots", "robotics", "humanoid", "automation", "boston dynamics", "figure", "optimus"],
  summary: "Robotics combines mechanical engineering, electronics, and AI to build machines that sense and act in the physical world. Over 4 million industrial robots work in factories, and AI-powered humanoids are the field's next frontier.",
  sections: [
    { h: "Types of robots", p: "Industrial arms weld and assemble with sub-millimeter repeatability. Mobile robots (AGVs/AMRs) shuttle goods through warehouses — Amazon runs 750,000+. Drones survey crops and deliver packages. Surgical robots like da Vinci assist millions of operations; legged machines like Boston Dynamics' Atlas and Spot handle terrain wheels can't; collaborative 'cobots' work safely beside people without cages." },
    { h: "The AI infusion", p: "Classical robotics struggled outside structured settings. Deep learning changed this: robots now recognize objects in clutter, and reinforcement learning plus simulation-to-real transfer teaches gaits and grasps. Vision-language-action models let humanoids follow spoken commands. Tesla Optimus, Figure, Agility's Digit, and Unitree's humanoids target logistics and manufacturing within this decade." },
    { h: "Economic impact", p: "Robot density is highest in South Korea, Singapore, and China — China installs over half the world's new robots. Automation raises productivity and reshoring feasibility while shifting labor demand toward oversight, maintenance, and programming roles. The International Federation of Robotics counts over 4.2 million industrial robots operating worldwide." },
    { h: "Hard problems", p: "Dexterous manipulation, long-duration autonomy, safety certification, and battery life remain open. Moravec's paradox persists: tasks trivial for toddlers (folding laundry) are fiendish for robots. Costs are falling fast — humanoid platforms dropped from millions to tens of thousands of dollars — while researchers chase general-purpose 'embodied AI'." }
  ],
  facts: [
    { k: "Industrial robots", v: ">4.2 million operating" },
    { k: "Top installer", v: "China (~50% of new robots)" },
    { k: "Famous walker", v: "Boston Dynamics Atlas" },
    { k: "Next frontier", v: "General-purpose humanoids" },
    { k: "Amazon fleet", v: "750,000+ mobile robots" }
  ],
  related: ["artificial-intelligence", "machine-learning", "electric-vehicles"]
},
{
  id: "cybersecurity",
  title: "Cybersecurity",
  category: "Technology",
  emoji: "🛡️",
  tags: ["cybersecurity", "security", "hacking", "hacker", "ransomware", "phishing", "malware", "encryption", "zero trust", "cyber attack"],
  summary: "Cybersecurity protects systems, networks, and data from digital attacks. With global cybercrime costs estimated in the trillions, defense-in-depth, zero-trust architecture, and AI-assisted detection define the modern practice.",
  sections: [
    { h: "The threat landscape", p: "Ransomware gangs encrypt victims' data and demand payment — Colonial Pipeline (2021) shut US fuel flows. Phishing remains the #1 entry point, now AI-crafted. State-sponsored groups conduct espionage and sabotage (Stuxnet; NotPetya caused $10B+ damage). Supply-chain attacks like SolarWinds compromise thousands via one vendor. Cybercrime costs are projected to reach $10+ trillion annually." },
    { h: "Core defenses", p: "Defense-in-depth layers controls: patch management, least-privilege access, network segmentation, endpoint detection, and immutable backups (the ransomware antidote). Multi-factor authentication blocks the vast majority of account-takeover attacks. Zero-trust architecture assumes the network is hostile and verifies every request — now US federal policy." },
    { h: "The role of AI", p: "Both sides wield AI. Attackers use it for convincing phishing at scale, vulnerability discovery, and deepfake social engineering; defenders use ML for anomaly detection across billions of events, automated triage, and hunting novel malware. Security operations centers increasingly deploy AI copilots, while regulators demand disclosure of material breaches within days." },
    { h: "People and practice", p: "Most breaches trace to human factors — reused passwords, clicked links — so training and phishing simulations matter as much as tooling. The field faces a persistent talent shortage of several million practitioners worldwide. Career paths span red teams (offense), blue teams (defense), forensics, and governance; certifications like Security+ and CISSP are common entry points." }
  ],
  facts: [
    { k: "Top attack vector", v: "Phishing" },
    { k: "Cybercrime cost", v: "$10T+ annually (est.)" },
    { k: "Key standard", v: "Zero-trust / NIST CSF" },
    { k: "Best ROI control", v: "MFA + patched software" },
    { k: "Workforce gap", v: "Millions unfilled worldwide" }
  ],
  related: ["blockchain", "artificial-intelligence", "internet-history"]
},
{
  id: "internet-history",
  title: "History of the Internet",
  category: "Technology",
  emoji: "🌐",
  tags: ["internet", "web", "world wide web", "arpanet", "history of internet", "tim berners-lee", "wifi"],
  summary: "The Internet grew from a 1969 US military research network into infrastructure connecting over 5 billion people. Key inventions — packet switching, TCP/IP, the World Wide Web — layered openness that enabled unprecedented innovation.",
  sections: [
    { h: "From ARPANET to Internet", p: "ARPANET linked four university computers in 1969, pioneering packet switching — chopping data into routed chunks rather than dedicated circuits. In 1974 Cerf and Kahn designed TCP/IP, letting different networks interconnect ('internetting'); ARPANET adopted it January 1, 1983, the Internet's birthday. Email was the first killer app (1971), and DNS (1983) replaced phone-book files with domain names." },
    { h: "The Web arrives", p: "In 1989–91 at CERN, Tim Berners-Lee created the World Wide Web: URLs, HTTP, and HTML, releasing it royalty-free. The Mosaic browser (1993) made it graphical and mainstream; Netscape, then the dot-com boom and bust followed. Broadband killed the dial-up tone, and Web 2.0 added user-generated content — Wikipedia, YouTube, Facebook — putting publishing in everyone's hands." },
    { h: "Mobile and cloud", p: "The iPhone (2007) and 3G/4G moved the internet into pockets; by the 2010s most traffic was mobile. Cloud computing (AWS, 2006) rented computing like electricity, and apps replaced websites as the dominant interface. Streaming displaced physical media; social platforms reshaped politics and culture; fiber and 5G pushed gigabit speeds." },
    { h: "Today and next", p: "Over 5.5 billion people — roughly two-thirds of humanity — are online, though a stubborn digital divide remains. Current battles: net neutrality, platform power, privacy, and misinformation. Emerging layers include the AI agent web (assistant-mediated browsing, which this Genspark clone mimics), satellite constellations like Starlink reaching remote areas, and debates over decentralization." }
  ],
  facts: [
    { k: "ARPANET", v: "1969 (4 nodes)" },
    { k: "TCP/IP switchover", v: "Jan 1, 1983" },
    { k: "Web invented", v: "1989–91, Berners-Lee @ CERN" },
    { k: "Users today", v: "5.5+ billion" },
    { k: "Mobile majority", v: "~60% of traffic" }
  ],
  related: ["cybersecurity", "artificial-intelligence", "blockchain"]
},
{
  id: "virtual-reality",
  title: "Virtual & Augmented Reality",
  category: "Technology",
  emoji: "🥽",
  tags: ["vr", "ar", "virtual reality", "augmented reality", "metaverse", "quest", "vision pro", "xr", "mixed reality"],
  summary: "Virtual reality immerses users in digital worlds; augmented reality overlays digital content on the physical one. Together as 'XR/spatial computing', they're advancing through lighter headsets, better displays, and AI-driven interaction.",
  sections: [
    { h: "VR vs AR vs MR", p: "VR headsets replace your surroundings entirely — gaming, training, therapy. AR adds digital layers to the real world via glasses or phones (Pokémon GO, 2016). Mixed reality anchors virtual objects so they interact with physical space. Apple reframed the category as 'spatial computing' with Vision Pro (2024), blending all three through high-resolution pass-through cameras." },
    { h: "Enabling technology", p: "Modern XR rests on pancake lenses, micro-OLED displays exceeding 3,000 pixels per inch, inside-out tracking that maps rooms without external sensors, and hand/eye tracking for controller-free input. Dedicated mobile chips (Snapdragon XR class) drive standalone headsets like Meta Quest 3, while foveated rendering concentrates detail where your eyes look." },
    { h: "Where it's used", p: "Gaming is the anchor — tens of millions of Quest headsets sold — but enterprise leads growth: surgeons rehearse operations, Boeing trains mechanics, Walmart trained a million employees. Therapists treat PTSD and phobias with controlled exposure; architects walk clients through unbuilt spaces; remote collaboration platforms beam avatars into shared 3D rooms." },
    { h: "Roadblocks", p: "Mass adoption stalls on cost, comfort (weight and heat), isolation, motion sickness for some users, and thin content libraries — the chicken-and-egg problem. The 'metaverse' hype cooled after 2022, but steady progress continues: AI generates 3D assets on demand, and lightweight AR glasses with contextual AI assistants are the industry's long-term prize." }
  ],
  facts: [
    { k: "Term coined", v: "VR — Jaron Lanier (1980s)" },
    { k: "Top seller", v: "Meta Quest line (20M+)" },
    { k: "Apple entry", v: "Vision Pro (Feb 2024)" },
    { k: "AR breakout", v: "Pokémon GO (2016)" },
    { k: "Key metric", v: "Comfort × immersion ÷ price" }
  ],
  related: ["artificial-intelligence", "semiconductors", "robotics"]
},
{
  id: "einstein",
  title: "Albert Einstein",
  category: "People",
  emoji: "👨‍🔬",
  tags: ["einstein", "albert einstein", "relativity", "e=mc2", "physicist", "theoretical physics"],
  summary: "Albert Einstein (1879–1955) was a theoretical physicist who revolutionized our understanding of space, time, gravity, and energy. His theories of relativity remain foundational to modern physics, and he received the 1921 Nobel Prize for explaining the photoelectric effect.",
  sections: [
    { h: "The miracle year", p: "Working as a Swiss patent clerk in 1905, Einstein published four papers that each could have secured his fame: explaining the photoelectric effect (founding quantum theory), analyzing Brownian motion (proving atoms exist), introducing special relativity, and deriving E = mc² — the equivalence of mass and energy. He was 26." },
    { h: "General relativity", p: "In 1915 Einstein completed general relativity, reimagining gravity not as a force but as the curvature of spacetime caused by mass and energy. It predicted the bending of starlight — confirmed dramatically by Eddington's 1919 eclipse expedition, making Einstein a global celebrity — plus black holes, gravitational waves (detected 2015), and the expanding universe." },
    { h: "Later life and the bomb", p: "Fleeing the Nazis in 1933, Einstein settled at Princeton. His 1939 letter to Roosevelt warning of German atomic research helped spur the Manhattan Project — though Einstein, a pacifist, never worked on it and later advocated nuclear disarmament. He spent his final decades seeking a unified field theory, resisting quantum mechanics' randomness ('God does not play dice')." },
    { h: "Legacy", p: "Relativity underpins GPS satellites (which must correct for time dilation to stay accurate), cosmology, and nuclear physics. Einstein's thought-experiment style and public persona — wild hair, wit, moral courage — made him the archetype of genius. Time named him Person of the Century in 1999." }
  ],
  facts: [
    { k: "Born", v: "1879, Ulm, Germany" },
    { k: "Miracle year", v: "1905 (4 papers)" },
    { k: "Nobel Prize", v: "1921 (photoelectric effect)" },
    { k: "Famous equation", v: "E = mc²" },
    { k: "Died", v: "1955, Princeton, USA" }
  ],
  related: ["black-holes", "marie-curie", "quantum-computing"]
},
{
  id: "marie-curie",
  title: "Marie Curie",
  category: "People",
  emoji: "⚗️",
  tags: ["marie curie", "curie", "radioactivity", "radium", "polonium", "nobel", "woman scientist"],
  summary: "Marie Curie (1867–1934) pioneered the study of radioactivity, discovered polonium and radium, and remains the only person to win Nobel Prizes in two different sciences. Her work founded radiochemistry and cancer radiotherapy.",
  sections: [
    { h: "From Warsaw to Paris", p: "Born Maria Skłodowska in Russian-occupied Poland, where women were barred from university, she attended the clandestine 'Flying University' and worked as a governess to fund her sister's medical studies. In 1891 she moved to Paris, studied physics and mathematics at the Sorbonne — topping her classes — and married physicist Pierre Curie in 1895." },
    { h: "Discovering radioactivity", p: "Investigating Becquerel's mysterious rays from uranium, Curie coined 'radioactivity' and showed it was an atomic property. Processing tons of pitchblende ore in a leaky shed, the Curies isolated two new elements in 1898: polonium (named for Poland) and radium, millions of times more radioactive than uranium. The 1903 Nobel Prize in Physics went to Becquerel and the Curies — Marie the first woman laureate." },
    { h: "A second Nobel and the war", p: "After Pierre's death in a 1906 street accident, Marie took his Sorbonne chair — its first female professor. Her 1911 Nobel Prize in Chemistry (for radium and polonium) made her the first person with two Nobels. In WWI she created mobile X-ray units — 'petites Curies' — driving them to the front to guide surgeons, training 150 women operators; an estimated million wounded soldiers were X-rayed." },
    { h: "Legacy and cost", p: "Decades of radiation exposure — safety was unknown — likely caused her fatal aplastic anemia in 1934; her notebooks remain radioactive today, stored in lead-lined boxes. Her daughter Irène also won a Nobel in Chemistry. Curie's institutes remain research powerhouses, and 'curie' and 'curium' carry her name across science." }
  ],
  facts: [
    { k: "Born", v: "1867, Warsaw, Poland" },
    { k: "Nobels", v: "Physics 1903, Chemistry 1911" },
    { k: "Discovered", v: "Polonium & radium (1898)" },
    { k: "Coined term", v: "'Radioactivity'" },
    { k: "Died", v: "1934, of radiation-linked illness" }
  ],
  related: ["einstein", "vaccines", "crispr-gene-editing"]
},
{
  id: "nikola-tesla",
  title: "Nikola Tesla",
  category: "People",
  emoji: "⚡",
  tags: ["tesla", "nikola tesla", "ac power", "alternating current", "edison", "induction motor", "wireless"],
  summary: "Nikola Tesla (1856–1943) was a Serbian-American inventor whose alternating-current system powers the modern electrical grid. A visionary of wireless communication and energy, he held around 300 patents and died in relative obscurity before posthumous fame.",
  sections: [
    { h: "The AC revolution", p: "Tesla emigrated to America in 1884 and briefly worked for Edison. Their split over direct vs alternating current became the 'war of the currents': Tesla's AC, developed with George Westinghouse, could be stepped to high voltages for efficient long-distance transmission, while Edison's DC fizzled over city blocks. AC won decisively — it lit the 1893 Chicago World's Fair and powered Niagara Falls in 1895." },
    { h: "Key inventions", p: "The polyphase AC induction motor (1887) became the industry's workhorse. The Tesla coil produced spectacular high-frequency discharges and underpinned early radio. Tesla demonstrated wireless remote control (a boat, 1898) and transmitted radio signals before Marconi's famous demonstration — the US Supreme Court in 1943 upheld Tesla's radio patent priority." },
    { h: "Wardenclyffe and wireless power", p: "Tesla dreamed of broadcasting power and messages through the Earth itself. His 57-meter Wardenclyffe Tower on Long Island (1901) was meant as a 'World Wireless System', but funding collapsed (J.P. Morgan withdrew) and the tower was demolished in 1917. Wireless information transmission, which he foresaw in detail, arrived; wireless bulk power remains largely unrealized." },
    { h: "Final years and legacy", p: "Eccentric, visionary, and a poor businessman, Tesla died nearly penniless in a New York hotel in 1943; the FBI famously seized his papers. The SI unit of magnetic flux density bears his name (1960), and Elon Musk named the EV company after him in 2003, cementing his pop-culture resurrection as the archetypal underappreciated genius." }
  ],
  facts: [
    { k: "Born", v: "1856, Smiljan (modern Croatia)" },
    { k: "Famous for", v: "AC power system & motor" },
    { k: "Rivalry", v: "'War of currents' vs Edison" },
    { k: "Patents", v: "~300 worldwide" },
    { k: "SI unit", v: "Tesla (magnetic flux density)" }
  ],
  related: ["einstein", "electric-vehicles", "renewable-energy"]
},
{
  id: "world-war-2",
  title: "World War II",
  category: "History",
  emoji: "🌏",
  tags: ["world war 2", "ww2", "wwii", "second world war", "d-day", "normandy", "pearl harbor", "holocaust", "hitler"],
  summary: "World War II (1939–1945) was the deadliest conflict in history, killing an estimated 70–85 million people. It redrew the global order, ended with the only wartime use of nuclear weapons, and produced the United Nations.",
  sections: [
    { h: "Outbreak", p: "The war traces to unresolved WWI grievances, the Great Depression, and expansionist fascism. Germany invaded Poland on September 1, 1939, drawing Britain and France in; Japan had invaded China in 1937. Blitzkrieg overran much of Europe in 1940. Hitler's invasion of the USSR (Operation Barbarossa, June 1941) and Japan's attack on Pearl Harbor (December 1941) globalized the war, involving over 30 countries." },
    { h: "Turning points", p: "Midway (June 1942) crippled Japanese naval aviation. El Alamein (late 1942) checked Axis advances in North Africa. Stalingrad (1942–43) destroyed the German Sixth Army and began the Soviet drive west. D-Day — June 6, 1944, the largest amphibious invasion ever — opened the Western Front. V-E Day came May 8, 1945; after atomic bombings of Hiroshima and Nagasaki and Soviet entry, Japan announced surrender August 15 (V-J Day)." },
    { h: "The Holocaust and home fronts", p: "The Nazi regime systematically murdered six million Jews, alongside Roma, disabled people, political prisoners, and others — industrialized genocide that shaped modern human-rights law. Total war mobilized entire economies: women entered factories en masse, rationing spread, and cities from London to Tokyo endured bombing. Civilian deaths exceeded military ones." },
    { h: "Consequences", p: "The war created the UN and the US–Soviet Cold War rivalry, accelerated decolonization, and seeded both the European Union and the nuclear age. Technology leapt: radar, jets, rockets, penicillin's mass production, and the first computers. Its memory anchors institutions built to prevent repetition — the foundation of the post-1945 international order." }
  ],
  facts: [
    { k: "Duration", v: "1939–1945" },
    { k: "Deaths", v: "70–85 million" },
    { k: "D-Day", v: "June 6, 1944 (Normandy)" },
    { k: "Major turning point", v: "Stalingrad & Midway" },
    { k: "Aftermath", v: "UN founded; Cold War begins" }
  ],
  related: ["cold-war", "roman-empire", "world-war-1"]
},
{
  id: "world-war-1",
  title: "World War I",
  category: "History",
  emoji: "🎖️",
  tags: ["world war 1", "ww1", "wwi", "great war", "trench warfare", "verdun", "somme"],
  summary: "World War I (1914–1918) pitted the Central Powers against the Allies in a grinding industrial conflict that killed around 20 million people. Its unresolved settlement sowed the seeds of World War II.",
  sections: [
    { h: "The slide to war", p: "A tangle of alliances, imperial rivalry, arms races, and nationalism made Europe a powder keg. The assassination of Archduke Franz Ferdinand in Sarajevo (June 1914) triggered an ultimatum chain; by August, Germany, Austria-Hungary, and Ottoman Turkey faced Britain, France, and Russia. The Schlieffen Plan's failed sweep through Belgium stalled at the Marne, hardening into 700 km of trenches from the North Sea to Switzerland." },
    { h: "Industrial slaughter", p: "Machine guns, barbed wire, and artillery outclassed offensive tactics, producing battles of horrifying attrition: Verdun and the Somme each cost around a million casualties. New weapons — poison gas, tanks, aircraft, U-boats — shaped the war. Unrestricted submarine warfare and the Zimmermann Telegram pulled the United States in during 1917; Russia exited after the Bolshevik Revolution." },
    { h: "Endgame and armistice", p: "Germany's Spring Offensive (1918) spent its reserves; Allied counterattacks with massed tanks and fresh American troops forced an armistice on November 11, 1918 — the 'eleventh hour of the eleventh day'. About 9–11 million soldiers and 6–13 million civilians died, followed by the Spanish flu pandemic, which killed up to 50 million more." },
    { h: "The flawed peace", p: "The Treaty of Versailles (1919) imposed reparations and war guilt on Germany while redrawing Europe and the Middle East from the corpse of four empires — German, Austro-Hungarian, Russian, Ottoman. The League of Nations failed to prevent aggression; economic collapse and resentment fed fascism. Historians call 1914–1945 a single 'thirty years' war' with an intermission." }
  ],
  facts: [
    { k: "Duration", v: "1914–1918" },
    { k: "Trigger", v: "Sarajevo assassination (1914)" },
    { k: "Deaths", v: "~20 million total" },
    { k: "Armistice", v: "Nov 11, 1918, 11 a.m." },
    { k: "Empires fallen", v: "4 (German, Austro-Hungarian, Russian, Ottoman)" }
  ],
  related: ["world-war-2", "cold-war", "roman-empire"]
},
{
  id: "roman-empire",
  title: "The Roman Empire",
  category: "History",
  emoji: "🏛️",
  tags: ["rome", "roman empire", "romans", "caesar", "augustus", "gladiator", "legion", "colosseum"],
  summary: "The Roman Empire dominated the Mediterranean world for five centuries, at its height ruling ~70 million people — a fifth of humanity. Its law, engineering, and language shaped Western civilization permanently.",
  sections: [
    { h: "From republic to empire", p: "Founded legendarily in 753 BCE, Rome was a republic for nearly 500 years, conquering Italy, then Carthage in the Punic Wars (including Hannibal's crossing of the Alps). Civil wars ended the republic: Julius Caesar defeated Pompey, was assassinated in 44 BCE, and his heir Octavian crushed Antony and Cleopatra, becoming Augustus in 27 BCE — the first emperor, inaugurating the Pax Romana." },
    { h: "Height of power", p: "Under Trajan (117 CE) the empire spanned 5 million km² from Britain to the Persian Gulf. Romans built 80,000 km of paved roads, aqueducts delivering a billion liters daily to Rome, the Colosseum (seating 50,000), and concrete structures like the Pantheon's still-unsurpassed unreinforced dome. Roman law, citizenship, and Latin bound diverse peoples into a common civilization." },
    { h: "Crisis and transformation", p: "The third century brought civil wars, plague, and inflation; Diocletian split administration into four parts, and Constantine legalized Christianity (313) and founded Constantinople (330). In 395 the empire formally divided. The Western half, weakened by economic strain, migrating peoples, and political paralysis, fell in 476 when Odoacer deposed Romulus Augustulus." },
    { h: "Enduring legacy", p: "The Eastern Roman (Byzantine) Empire lasted until 1453. Rome's fingerprints remain: Romance languages for 800 million speakers, legal systems from Louisiana to Japan, the calendar, urban planning, and the very idea of 'senate' and 'republic'. 'All roads lead to Rome' endures because, in many senses, they still do." }
  ],
  facts: [
    { k: "Founded", v: "753 BCE (legendary)" },
    { k: "Empire begins", v: "27 BCE (Augustus)" },
    { k: "Peak extent", v: "5M km², ~70M people" },
    { k: "Western fall", v: "476 CE" },
    { k: "Eastern end", v: "1453 (Constantinople)" }
  ],
  related: ["world-war-2", "great-wall-china", "cold-war"]
},
{
  id: "cold-war",
  title: "The Cold War",
  category: "History",
  emoji: "🧊",
  tags: ["cold war", "soviet union", "ussr", "usa ussr", "berlin wall", "cuban missile crisis", "nato", "space race"],
  summary: "The Cold War (1947–1991) was the ideological standoff between the US-led capitalist West and the Soviet-led communist East — fought through proxies, espionage, and an arms race, without direct superpower war. It ended with the USSR's dissolution.",
  sections: [
    { h: "Origins", p: "Wartime allies turned rivals almost immediately: Stalin imposed communist governments across Eastern Europe — Churchill's 'Iron Curtain' (1946). The US answered with containment: the Truman Doctrine, the Marshall Plan rebuilding Western Europe, and NATO (1949). The Soviet blockade of West Berlin (1948–49) was defeated by the Berlin Airlift, supplying a city by plane for eleven months." },
    { h: "Crises and proxies", p: "The Korean War (1950–53) drew the first battle lines. The Cuban Missile Crisis (October 1962) — Soviet nuclear missiles 150 km from Florida — brought 13 days on the edge of Armageddon before a negotiated withdrawal. Vietnam, Afghanistan (Soviet invasion, 1979), and Africa became proxy battlegrounds. The Sino-Soviet split and Nixon's 1972 opening to China reshuffled the board." },
    { h: "The space race and arms race", p: "Sputnik (1957) and Gagarin's first human spaceflight (1961) stunned the West; Kennedy's response — Apollo 11's Moon landing in 1969 — won the marquee event. Meanwhile arsenals swelled past 60,000 warheads under 'mutually assured destruction'. Détente produced arms treaties (SALT, INF), while the Space Race spun off satellites, microelectronics, and eventually GPS." },
    { h: "The end", p: "Economic stagnation, the Afghan quagmire, and the Reagan-era arms buildup strained the USSR. Gorbachev's reforms — glasnost (openness) and perestroika (restructuring) — loosened control faster than intended. Eastern Europe's communist regimes fell through 1989; the Berlin Wall fell November 9. The Soviet Union dissolved on December 25, 1991, leaving the US as sole superpower and a newly reconfigured world map." }
  ],
  facts: [
    { k: "Duration", v: "1947–1991" },
    { k: "Closest call", v: "Cuban Missile Crisis (1962)" },
    { k: "Space firsts", v: "Sputnik '57, Gagarin '61, Apollo '69" },
    { k: "Wall falls", v: "Nov 9, 1989 (Berlin)" },
    { k: "USSR dissolves", v: "Dec 25, 1991" }
  ],
  related: ["world-war-2", "mars-exploration", "roman-empire"]
},
{
  id: "great-wall-china",
  title: "The Great Wall of China",
  category: "Places",
  emoji: "🧱",
  tags: ["great wall", "china wall", "great wall of china", "badaling", "ming dynasty wall"],
  summary: "The Great Wall of China is a series of fortifications built across two millennia to protect states from northern nomads. Its total length, including all branches, exceeds 21,000 km — the largest construction project in human history.",
  sections: [
    { h: "Two thousand years of building", p: "Walls began with rival states in the 7th century BCE. After unifying China in 221 BCE, Qin Shi Huang connected and extended them into a '10,000-li wall' — built partly by conscripts in brutal conditions. Dynasties repaired or abandoned sections; most of the iconic stone-and-brick wall visited today dates to the Ming dynasty (1368–1644), rebuilt to resist the Mongols." },
    { h: "Engineering on the ridgelines", p: "The Ming wall runs ~8,850 km (21,196 km counting all dynasties' branches), averaging 6–7 m high with watchtowers, beacon stations for smoke/fire signaling, barracks, and passes doubling as trade checkpoints. Builders used local materials — tamped earth in deserts, brick and stone in mountains — threading ramparts along razorback ridges to command terrain." },
    { h: "Did it work?", p: "The wall was less an impregnable barrier than a system: slowing raiders, channeling attacks to defensible gates, enabling rapid signaling, and regulating trade and migration. It failed strategically when empires were weak — the Ming fell to the Manchus in 1644 — yet shaped the frontier between agrarian China and the steppe for centuries, influencing both cultures." },
    { h: "Today", p: "Contrary to myth, the wall is not visible from the Moon with the naked eye. It is a UNESCO World Heritage Site (1987) drawing tens of millions of visitors annually, while weathering erodes remote stretches — preservation is an ongoing national project. Sections like Badaling and Mutianyu near Beijing are restored; wild parts like Jiankou appeal to hikers." }
  ],
  facts: [
    { k: "Total length", v: "21,196 km (all dynasties)" },
    { k: "Begun", v: "7th century BCE" },
    { k: "Iconic sections", v: "Ming era (1368–1644)" },
    { k: "UNESCO listing", v: "1987" },
    { k: "Moon myth", v: "Not naked-eye visible" }
  ],
  related: ["taj-mahal", "roman-empire", "world-war-2"]
},
{
  id: "taj-mahal",
  title: "The Taj Mahal",
  category: "Places",
  emoji: "🕌",
  tags: ["taj mahal", "agra", "india monument", "shah jahan", "mumtaz", "seven wonders"],
  summary: "The Taj Mahal is a white-marble mausoleum in Agra, India, built by Mughal emperor Shah Jahan for his wife Mumtaz Mahal. Completed in 1653 after two decades of work by 20,000 artisans, it is considered the finest example of Mughal architecture.",
  sections: [
    { h: "A monument to love", p: "Mumtaz Mahal died in 1631 giving birth to the couple's 14th child. Shah Jahan commissioned a tomb of unprecedented beauty on the Yamuna riverbank. Construction (1632–1653) employed some 20,000 workers and 1,000 elephants, directed by a board of architects blending Persian, Islamic, and Indian traditions. The emperor reportedly planned a black-marble twin for himself across the river — never built; he was deposed by his son and buried beside Mumtaz." },
    { h: "Architecture", p: "The 73 m central dome rises over an octagonal chamber in perfect bilateral symmetry — minarets lean subtly outward so an earthquake would topple them away from the tomb. Makrana marble is inlaid with 28 types of semiprecious stones forming Quranic calligraphy and floral pietra dura, carved with a delicacy that shifts color from dawn-pink to moonlight-silver. Charbagh gardens evoke paradise described in the Quran." },
    { h: "Recognition and pressure", p: "Designated a UNESCO World Heritage Site (1983) and voted one of the New Seven Wonders (2007), the Taj draws 5–7 million visitors a year. Air pollution once yellowed the marble, prompting a protected zone around Agra and periodic mud-pack cleanings; river-level decline threatens foundations, making conservation a continuing effort." },
    { h: "Visiting", p: "The complex opens at sunrise; crowds thin in winter mornings. The classic reveal is through the Great Gate's arch, framing the mausoleum at the end of a reflecting channel. Moonlight viewing is offered five nights a month around the full moon. Closed Fridays for prayers at the functioning mosque within the complex." }
  ],
  facts: [
    { k: "Built", v: "1632–1653" },
    { k: "Commissioned by", v: "Shah Jahan for Mumtaz" },
    { k: "Dome height", v: "73 m" },
    { k: "Workers", v: "~20,000 + 1,000 elephants" },
    { k: "Visitors", v: "5–7 million/year" }
  ],
  related: ["great-wall-china", "roman-empire", "olympics"]
},
{
  id: "photosynthesis",
  title: "Photosynthesis",
  category: "Science",
  emoji: "🌿",
  tags: ["photosynthesis", "plants", "chlorophyll", "oxygen", "calvin cycle", "leaf", "sunlight energy"],
  summary: "Photosynthesis is the process by which plants, algae, and cyanobacteria convert sunlight, water, and CO₂ into glucose and oxygen. It powers nearly all food chains and produced Earth's oxygen-rich atmosphere.",
  sections: [
    { h: "The chemistry of life", p: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Inside chloroplasts, chlorophyll absorbs mainly red and blue light (reflecting green). Light reactions in thylakoid membranes split water — releasing the oxygen we breathe — and generate energy carriers ATP and NADPH. Photosynthesis annually fixes ~100+ billion tonnes of carbon, the base of almost every food web on Earth." },
    { h: "The Calvin cycle", p: "In the stroma, the enzyme RuBisCO — likely the most abundant protein on Earth — captures CO₂ and, powered by ATP and NADPH, builds sugar through the Calvin cycle. C3 plants use this directly; C4 plants (corn, sugarcane) and CAM plants (cacti, pineapple) evolved CO₂-concentrating tricks to thrive in heat and drought by minimizing photorespiration." },
    { h: "How it changed the planet", p: "Around 2.4 billion years ago, cyanobacterial photosynthesis triggered the Great Oxidation Event, transforming a methane-hazed world into an oxygenated one — enabling complex life and the ozone layer, while wiping out much anaerobic life. Today phytoplankton in oceans produce roughly half of Earth's oxygen and drive the biological carbon pump that locks CO₂ into deep waters." },
    { h: "Lessons for technology", p: "Artificial photosynthesis research seeks leaf-inspired solar fuels — splitting water into hydrogen or reducing CO₂ to fuels with catalysts. Crop scientists engineer more efficient photosynthesis (e.g., improved photorespiration bypasses) toward the yield gains needed to feed 10 billion people without clearing more land." }
  ],
  facts: [
    { k: "Inputs", v: "CO₂ + water + sunlight" },
    { k: "Outputs", v: "Glucose + oxygen" },
    { k: "Pigment", v: "Chlorophyll (green)" },
    { k: "Key enzyme", v: "RuBisCO (Calvin cycle)" },
    { k: "Global impact", v: "Created O₂ atmosphere ~2.4B yrs ago" }
  ],
  related: ["climate-change", "oceans", "renewable-energy"]
},
{
  id: "immune-system",
  title: "The Human Immune System",
  category: "Health",
  emoji: "🦠",
  tags: ["immune system", "immunity", "antibodies", "white blood cells", "infection", "immune", "t cells"],
  summary: "The immune system is the body's defense network against pathogens — a multilayered system of barriers, rapid innate responses, and adaptive cells that remember past invaders. It must balance aggression with tolerance to avoid attacking the body itself.",
  sections: [
    { h: "Layered defenses", p: "First come barriers: skin, mucus, stomach acid, and beneficial microbes. The innate immune system responds within minutes — neutrophils and macrophages engulf invaders, inflammation recruits reinforcements, and fever slows pathogens. It reacts to generic danger patterns rather than specific enemies, buying time for the adaptive system." },
    { h: "Adaptive immunity", p: "T cells (matured in the thymus) coordinate responses and kill infected cells; B cells produce antibodies — Y-shaped proteins that precisely neutralize specific pathogens and tag them for destruction. Crucially, the system forms memory cells after each encounter, which is why many diseases strike once — and how vaccines teach protection without illness." },
    { h: "When it goes wrong", p: "Autoimmune diseases (type 1 diabetes, rheumatoid arthritis, multiple sclerosis) occur when tolerance fails and the system attacks the body — affecting roughly 1 in 10 people. Allergies are overreactions to harmless substances. Immunodeficiencies, from genetic SCID to acquired HIV/AIDS, leave the body exposed. Cancer immunotherapy flips the script, unleashing T cells — checkpoint inhibitors have turned some terminal cancers into manageable diseases." },
    { h: "Supporting your immunity", p: "No single food 'boosts' immunity, but sleep, regular exercise, vaccination, not smoking, and managing stress measurably improve immune function. Gut microbiota educate immune cells — early-life diversity shapes lifelong responses. Chronic sleep deprivation, by contrast, halves the antibody response to flu vaccines in studies." }
  ],
  facts: [
    { k: "Key cells", v: "T cells, B cells, macrophages" },
    { k: "Weapons", v: "Antibodies (precision-guided)" },
    { k: "Memory", v: "Basis of vaccination" },
    { k: "Failure mode", v: "Autoimmunity (~1 in 10)" },
    { k: "Best 'booster'", v: "Sleep, vaccines, exercise" }
  ],
  related: ["vaccines", "sleep-science", "crispr-gene-editing"]
},
{
  id: "vaccines",
  title: "Vaccines",
  category: "Health",
  emoji: "💉",
  tags: ["vaccine", "vaccines", "vaccination", "immunization", "mrna", "smallpox", "polio", "covid vaccine"],
  summary: "Vaccines train the immune system to recognize pathogens without causing disease. They prevent 3.5–5 million deaths annually, eradicated smallpox, and their newest form — mRNA — was developed in days once COVID-19's genome was published.",
  sections: [
    { h: "A brief history", p: "Variolation against smallpox was practiced in China and the Ottoman Empire centuries before Edward Jenner's 1796 breakthrough: inoculation with cowpox, a mild relative (vacca = cow, hence 'vaccine'). Pasteur developed rabies and anthrax vaccines in the 1880s. The 20th century added diphtheria, measles, and polio — polio vaccines by Salk (injected, 1955) and Sabin (oral, 1961) brought a childhood terror to the brink of eradication." },
    { h: "How they work", p: "Vaccines present the immune system with a harmless preview: inactivated viruses, live-but-weakened strains, protein subunits, or genetic instructions (mRNA, viral vectors) for making a single pathogen protein. B cells generate antibodies; memory cells stand guard for years. Adjuvants amplify the signal. Herd immunity emerges when enough people are immune that transmission chains die, protecting those who can't be vaccinated." },
    { h: "The mRNA revolution", p: "COVID-19 mRNA vaccines were designed in January 2020 within days of the genome's release and authorized within a year — built on decades of work by Karikó and Weissman (2023 Nobel). The platform is fast and programmable: trials now target flu, RSV (approved 2023), HIV, and personalized cancer vaccines that train T cells against a tumor's unique mutations." },
    { h: "Safety and impact", p: "Vaccines undergo phased trials and continuous monitoring (like the VAERS and VSD systems); serious adverse events are rare — on the order of one per hundreds of thousands to millions — while diseases they prevent killed millions yearly. The WHO credits immunization programs with preventing 154 million deaths over 50 years, ~95 of every 100 of them children. Smallpox remains the only human disease eradicated (1980)." }
  ],
  facts: [
    { k: "First vaccine", v: "Smallpox (Jenner, 1796)" },
    { k: "Deaths prevented", v: "3.5–5M per year (WHO)" },
    { k: "Eradicated", v: "Smallpox (1980)" },
    { k: "mRNA design time", v: "Days (COVID, Jan 2020)" },
    { k: "Polio status", v: "99.9% reduced; near-eradication" }
  ],
  related: ["immune-system", "crispr-gene-editing", "sleep-science"]
},
{
  id: "sleep-science",
  title: "The Science of Sleep",
  category: "Health",
  emoji: "😴",
  tags: ["sleep", "insomnia", "rem sleep", "dreams", "circadian", "melatonin", "sleep science"],
  summary: "Sleep is a fundamental biological state in which the brain consolidates memories, clears metabolic waste, and regulates hormones. Adults need 7–9 hours; chronic short sleep raises risks of heart disease, diabetes, and dementia.",
  sections: [
    { h: "Why we sleep", p: "During sleep the brain replays the day, transferring memories from the hippocampus to long-term storage and pruning weak connections. The glymphatic system flushes metabolic waste — including beta-amyloid linked to Alzheimer's — at up to twice the waking rate. Growth hormone surges, tissues repair, and immune function resets. Matthew Walker's bestseller 'Why We Sleep' calls it 'the single most effective thing we can do to reset brain and body health'." },
    { h: "Sleep architecture", p: "Nights cycle ~5 times through 90-minute stages: light N1/N2 (with 'sleep spindles' that aid learning), deep slow-wave N3 (physical restoration, hardest to wake from), and REM — when vivid dreams occur, muscles paralyze, and emotional memories get processed. Deep sleep dominates early night; REM lengthens toward morning, so cutting sleep short disproportionately steals dream sleep." },
    { h: "Circadian rhythms", p: "A master clock in the suprachiasmatic nucleus synchronizes the body to light, winning the 2017 Nobel Prize for its discoverers. Morning light anchors the rhythm; evening blue-rich light delays melatonin release and pushes sleep later. Teenagers shift naturally ~2 hours later — the basis for later school start policies. Jet lag and shift work desynchronize the clock, with measurable health costs." },
    { h: "Sleeping better", p: "Evidence-backed basics: consistent times (even weekends), a dark, cool room (~18°C), morning daylight, caffeine cutoff 8–10 hours before bed, and limiting alcohol, which fragments REM. For chronic insomnia, CBT-I outperforms sleeping pills long-term and is the first-line treatment. One-third of adults sleep under 7 hours — the WHO classifies industrial-world sleep loss as a public-health problem." }
  ],
  facts: [
    { k: "Adult need", v: "7–9 hours/night" },
    { k: "Cycle length", v: "~90 minutes × ~5" },
    { k: "Deep sleep role", v: "Physical repair, glymphatic cleaning" },
    { k: "REM role", v: "Memory & emotion processing" },
    { k: "Nobel", v: "2017 — circadian clock genes" }
  ],
  related: ["immune-system", "vaccines", "coffee"]
},
{
  id: "stock-market",
  title: "How the Stock Market Works",
  category: "Money",
  emoji: "📊",
  tags: ["stock market", "stocks", "investing", "shares", "nasdaq", "nyse", "index fund", "s&p 500", "bull market", "bear market"],
  summary: "The stock market is a network of exchanges where shares of companies are bought and sold. It lets companies raise capital and investors share in growth — the S&P 500 has returned roughly 10% annually over the long run, despite periodic crashes.",
  sections: [
    { h: "What a stock is", p: "A share is fractional ownership of a company — a claim on its assets and future profits. Companies list via an IPO to raise capital; afterward shares trade between investors on exchanges like the NYSE and Nasdaq. Prices are set by continuous auctions of supply and demand, and in aggregate the market discounts expectations about future earnings, interest rates, and risk." },
    { h: "Key mechanics", p: "Market capitalization = price × shares. Indexes like the S&P 500 or Dow track baskets of stocks as market barometers. Most daily volume now comes from institutions and algorithms; individuals typically trade through brokers with zero-commission apps. Core concepts: dividends (profit payouts), valuation ratios (P/E = price-to-earnings), and volatility, measured by the VIX 'fear index'." },
    { h: "Bulls, bears, and bubbles", p: "Bull markets (rising prices) and bears (falls of 20%+) alternate with the business cycle. Famous crashes — 1929, Black Monday 1987, dot-com 2000, the 2008 financial crisis, COVID's 2020 plunge — each mark excess unwinding, yet every bear market so far has eventually given way to new highs. Bubbles form when prices detach from fundamentals; detecting them in real time is notoriously hard." },
    { h: "Investing wisely", p: "Evidence favors patience: low-cost index funds beat most active managers over decades after fees. Diversification reduces single-company risk; time in the market beats timing the market; compounding turns steady contributions into large sums. As Buffett puts it, the stock market transfers money from the impatient to the patient." }
  ],
  facts: [
    { k: "Oldest exchange", v: "Amsterdam (1602, VOC)" },
    { k: "Long-run return", v: "S&P 500 ≈ 10%/yr nominal" },
    { k: "Largest exchanges", v: "NYSE & Nasdaq" },
    { k: "Bear market", v: "−20% from peak" },
    { k: "First trillion $ co.", v: "Apple (2018)" }
  ],
  related: ["inflation", "blockchain", "semiconductors"]
},
{
  id: "inflation",
  title: "Inflation Explained",
  category: "Money",
  emoji: "💸",
  tags: ["inflation", "prices", "interest rates", "cpi", "federal reserve", "monetary policy", "hyperinflation", "cost of living"],
  summary: "Inflation is the general rise in prices over time, eroding purchasing power. Central banks target ~2% annually; the 2021–23 surge — the highest in four decades — was tamed by the fastest rate-hiking cycle in modern history.",
  sections: [
    { h: "What inflation is", p: "Measured by indices like the Consumer Price Index (CPI) tracking a basket of goods, inflation means each unit of currency buys less. If inflation is 5%, $100 of goods costs $105 a year later. Moderate, predictable inflation greases the economy — deflation encourages delaying purchases and is worse — while high inflation distorts decisions and hits fixed incomes hardest." },
    { h: "Causes", p: "Demand-pull: too much spending chasing too few goods (stimulus-fueled post-COVID demand). Cost-push: supply shocks raise production costs (1970s oil embargoes; 2022 energy spike). Monetary: sustained money-supply growth outpacing output. Expectations become self-fulfilling — workers demand raises, firms pre-raise prices — which is why anchoring expectations is central banks' core job." },
    { h: "The 2021–23 episode", p: "US inflation peaked at 9.1% (June 2022), a 40-year high, driven by pandemic supply snarls, stimulus, labor tightness, and the energy shock after Russia's invasion of Ukraine. The Fed hiked rates from near-zero to 5.25–5.50% in 16 months — the fastest cycle since the 1980s — engineering a 'soft landing': inflation fell toward ~3% without recession, defying many forecasts." },
    { h: "Historical extremes", p: "Hyperinflation devastates: Weimar Germany 1923 (a wheelbarrow of marks for bread), Hungary 1946 (prices doubling every 15 hours), Zimbabwe 2008 (100-trillion-dollar notes), Venezuela 2018 (IMF-estimated 1,000,000%+). Each ended with monetary regime change — new currencies, dollarization, or central-bank reform — underscoring that inflation is ultimately a credibility problem." }
  ],
  facts: [
    { k: "Typical target", v: "~2% per year" },
    { k: "US peak (2022)", v: "9.1% (June), 40-yr high" },
    { k: "Fed response", v: "0% → 5.5% in 16 months" },
    { k: "Worst ever", v: "Hungary 1946 hyperinflation" },
    { k: "Measurer", v: "CPI (consumer price index)" }
  ],
  related: ["stock-market", "blockchain", "renewable-energy"]
},
{
  id: "oceans",
  title: "Earth's Oceans",
  category: "Nature",
  emoji: "🌊",
  tags: ["ocean", "oceans", "sea", "marine", "mariana trench", "deep sea", "coral reef", "ocean exploration"],
  summary: "Oceans cover 71% of Earth's surface, hold 97% of its water, and produce about half its oxygen. Yet over 80% of the ocean remains unmapped and unexplored — we have better maps of Mars than of our own seafloor.",
  sections: [
    { h: "The blue planet", p: "The global ocean, usually named as five basins (Pacific, Atlantic, Indian, Southern, Arctic), averages 3,688 m deep. It absorbs ~90% of excess heat from global warming and ~25% of human CO₂ emissions, buffering climate change at the cost of warming and acidification. Circulation systems like the Atlantic Meridional Overturning Circulation move heat poleward, shaping weather worldwide." },
    { h: "Life below", p: "Phytoplankton generate ~50% of Earth's oxygen and anchor food webs feeding 3 billion people who rely on seafood as primary protein. Coral reefs host a quarter of marine species on 0.1% of ocean area. The deep sea — largest habitat on Earth — teems with life around hydrothermal vents independent of sunlight, and the Mariana Trench plunges 10,935 m, deeper than Everest is tall." },
    { h: "Exploration", p: "Only ~5% of the ocean has been explored by humans; standard seafloor maps resolve ~5 km features. Piccard and Walsh reached the trench bottom in 1960 (Trieste); James Cameron returned solo in 2012; Victor Vescovo has now dived all five oceans' deepest points. Fleets of autonomous floats (4,000-strong Argo network) and seabed-mapping projects (Seabed 2030) are accelerating discovery." },
    { h: "Threats and protection", p: "Overfishing has depleted a third of assessed stocks; plastic pollution reaches 11 million tonnes annually and has been found in the trench; warming drives repeated mass coral bleaching. Responses include marine protected areas (target: 30% of ocean by 2030), the 2023 UN High Seas Treaty, and restored fisheries — proof that management works when applied." }
  ],
  facts: [
    { k: "Coverage", v: "71% of Earth's surface" },
    { k: "Deepest point", v: "Mariana Trench, ~10,935 m" },
    { k: "Oxygen made", v: "~50% (phytoplankton)" },
    { k: "Unexplored", v: "~80% unmapped/unseen" },
    { k: "Heat absorbed", v: "~90% of excess warming" }
  ],
  related: ["climate-change", "photosynthesis", "mars-exploration"]
},
{
  id: "dinosaurs",
  title: "Dinosaurs",
  category: "Nature",
  emoji: "🦖",
  tags: ["dinosaur", "dinosaurs", "t-rex", "tyrannosaurus", "jurassic", "extinction", "fossils", "velociraptor"],
  summary: "Dinosaurs ruled Earth for over 160 million years before an asteroid ended their reign 66 million years ago — all except the lineage that became birds. Over 11,000 species are known, and modern birds are, scientifically, living dinosaurs.",
  sections: [
    { h: "Reign of the giants", p: "Dinosaurs emerged ~230 million years ago in the Triassic and dominated the Jurassic and Cretaceous. They split into lizard-hipped (saurischians: long-necked sauropods and meat-eating theropods) and bird-hipped (ornithischians: stegosaurs, triceratops, duckbills). Argentinosaurus may have reached 35 m and 70+ tonnes; T. rex bit with the force of roughly three cars' weight." },
    { h: "Feathered revelations", p: "Since the 1990s, spectacularly preserved Chinese fossils proved many theropods wore feathers — Velociraptor was turkey-sized and plumaged, not the oversized movie monster. Pigment studies revealed real colors: Sinosauropteryx had a ginger striped tail. T. rex vision and smell were superb; some dinosaurs nurtured nests colonially; trackways show herding behavior." },
    { h: "The day the Mesozoic ended", p: "Sixty-six million years ago a ~10 km asteroid struck Chicxulub, Mexico with energy of billions of Hiroshima bombs: mega-tsunamis, global firestorms, then a years-long impact winter as sulfate aerosols blocked sunlight. ~75% of species died, including all non-avian dinosaurs — confirmed by a worldwide iridium layer (Alvarez hypothesis, 1980) and the crater's 1990s discovery. Mammals inherited the Earth." },
    { h: "Living dinosaurs", p: "Birds ARE avian dinosaurs — cladistically, a sparrow outranks T. rex in 'dinosaur-ness' continuity. With ~11,000 living bird species, dinosaurs arguably still outnumber mammals. Paleontology is booming: ~50 new species described yearly, soft tissue and even ancient biomolecules occasionally recovered, and CT scanning revealing brains and embryos inside eggs." }
  ],
  facts: [
    { k: "Ruled for", v: "~165 million years" },
    { k: "Extinction", v: "66 Mya, Chicxulub asteroid" },
    { k: "Largest", v: "Argentinosaurus (~35 m)" },
    { k: "Living descendants", v: "Birds (avialae)" },
    { k: "Known species", v: "11,000+ (non-avian)" }
  ],
  related: ["oceans", "photosynthesis", "james-webb"]
},
{
  id: "olympics",
  title: "The Olympic Games",
  category: "Culture",
  emoji: "🏅",
  tags: ["olympics", "olympic games", "summer olympics", "winter olympics", "paris 2024", "gold medal", "athletics"],
  summary: "The Olympic Games are the world's premier sporting event, revived in 1896 from ancient Greek festivals and now hosting ~200 nations every four years across summer and winter editions.",
  sections: [
    { h: "Ancient origins", p: "Games at Olympia honored Zeus from 776 BCE, held every four years for over a millennium; victors won olive wreaths and eternal fame, with city-states observing the Olympic truce. Roman emperor Theodosius I banned them in 393 CE. Fifteen centuries later, French educator Pierre de Coubertin revived the Games: Athens 1896 featured 241 athletes from 14 nations — all men, competing in nine sports." },
    { h: "The modern spectacle", p: "The Games grew into the biggest regularly scheduled event on Earth: Paris 2024 hosted ~10,500 athletes from 206 delegations in 329 medal events, watched by a global audience in the billions. Symbols bind editions together — the five rings (1913), torch relay (1936), opening and closing ceremonies blending sport and host culture. Women first competed in 1900; Paris 2024 was the first Games with full gender parity in athlete quotas." },
    { h: "Historic moments", p: "Jesse Owens' four golds in Hitler's Berlin (1936); Abebe Bikila's barefoot marathon (1960); the Black Power salute (1968); Nadia Comăneci's perfect 10 (1976); the Miracle on Ice (1980); Usain Bolt's triple-triple sprint dominance (2008–16); Michael Phelps' record 23 golds. Politics shadowed boycotts (1980/84) and Munich's 1972 tragedy, reminding that sport mirrors the world." },
    { h: "Costs and questions", p: "Hosting costs routinely reach $10–50+ billion, with white-elephant venues in Athens and Rio cautionary tales. Reforms now favor existing venues and rotating anchors (Los Angeles 2028, Brisbane 2032). Ongoing challenges: doping integrity (WADA), athlete welfare, commercial balance, and defining the Games' role in a fragmented media age." }
  ],
  facts: [
    { k: "Ancient start", v: "776 BCE, Olympia" },
    { k: "Modern revival", v: "1896, Athens" },
    { k: "Editions", v: "Summer + Winter, 4-yr cycle" },
    { k: "Most golds", v: "Michael Phelps (23)" },
    { k: "Next Summer Games", v: "Los Angeles 2028" }
  ],
  related: ["roman-empire", "taj-mahal", "coffee"]
},
{
  id: "coffee",
  title: "Coffee",
  category: "Culture",
  emoji: "☕",
  tags: ["coffee", "espresso", "caffeine", "latte", "arabica", "barista", "starbucks"],
  summary: "Coffee is the world's most popular psychoactive beverage — an estimated 2+ billion cups drunk daily. From Ethiopian legend to a $460+ billion global industry, its story spans Sufi monasteries, Viennese cafés, and third-wave roasters.",
  sections: [
    { h: "From goat herders to global ritual", p: "Legend credits Ethiopian goatherd Kaldi (~850) with noticing energized goats eating red cherries. By the 1400s Sufis in Yemen brewed qahwa for night rituals; coffeehouses ('schools of the wise') spread through the Ottoman Empire to Venice (1615), London (1650s — Lloyd's and the stock exchange began in cafés), and Vienna (1683). Colonial plantations broke the Arab monopoly, making Brazil the top producer by the 1850s — still true today." },
    { h: "Bean to cup", p: "Two species dominate: Arabica (60–70%, smoother, grown at altitude) and Robusta (stronger, more caffeine, disease-resistant). Cherries are picked, processed (washed/natural), dried, milled, shipped green, then roasted — the Maillard reactions creating hundreds of aroma compounds. Freshness and grind size steer extraction; espresso forces 9-bar water through fine grounds in ~25 seconds for concentrated crema-topped shots." },
    { h: "The three waves", p: "First wave: mass-market convenience (instant, Folgers). Second: espresso culture scaled globally by Starbucks (founded 1971), introducing latte vocabulary worldwide. Third wave (2000s+): coffee as craft — single-origin traceability, light roasts, pour-overs, competitions, and direct trade paying farmers premiums. Specialty shops now profilerare varieties like Gesha fetching record auction prices." },
    { h: "Health and economics", p: "Caffeine blocks adenosine receptors, sharpening alertness 15–45 minutes after drinking. Large studies associate moderate intake (3–4 cups/day) with lower risks of type 2 diabetes, Parkinson's, and liver disease. The industry supports ~125 million people, yet farming faces a crisis: climate change could halve suitable arabica land by 2050, driving research into resilient varieties and agroforestry." }
  ],
  facts: [
    { k: "Origin", v: "Ethiopia; brewed first in Yemen" },
    { k: "Daily cups", v: "2+ billion worldwide" },
    { k: "Top producer", v: "Brazil (~40%)" },
    { k: "Species", v: "Arabica & Robusta" },
    { k: "Healthy dose", v: "≈3–4 cups/day (studies)" }
  ],
  related: ["sleep-science", "olympics", "stock-market"]
},
{
  id: "iss",
  title: "International Space Station",
  category: "Space",
  emoji: "🛰️",
  tags: ["iss", "space station", "international space station", "astronauts", "nasa station", "microgravity"],
  summary: "The International Space Station is the largest structure ever assembled in space — a continuously inhabited laboratory orbiting Earth since 2000, operated by five space agencies from 15 nations.",
  sections: [
    { h: "A football field in orbit", p: "The ISS spans 109 m — about an American football field — with a mass of ~420 tonnes, pressing 16 sunrises and sunsets daily as it orbits every 90 minutes at 28,000 km/h and ~420 km altitude. Assembly began in 1998, uniting NASA, Roscosmos, ESA, JAXA, and CSA in the largest international engineering project after the Cold War, at a cost exceeding $150 billion." },
    { h: "Continuous occupation", p: "Since November 2, 2000, astronauts have lived aboard without interruption — over 280 people from 23 countries. Crews of typically seven conduct ~3,000 experiments in microgravity: protein crystallization, fluid physics, plant growth in the Veggie garden, and long-duration human health studies mapping the effects of space on bones, muscles, and vision — critical for Mars planning." },
    { h: "Getting there", p: "Space Shuttles and Russian Soyuz built the station; since 2020 SpaceX's Crew Dragon restored US crewed launch, with rotations roughly every six months. Cargo arrives via Dragon, Cygnus, and Progress vehicles. Spacewalks (275+) maintain the exterior; in 2024 Boeing's Starliner began crewed test flights — a reminder that station operations remain humanity's hardest routine commute." },
    { h: "The end of an era", p: "Modules are aging — cracks and leaks temper life's expectancy. Partners committed to operations through 2030, after which SpaceX's 'deorbit vehicle' will guide a controlled reentry over the Pacific. Commercial successors are funded (Axiom Station, Orbital Reef, Starlab), China operates its own Tiangong station, and NASA pivots to the Moon via Artemis' Gateway." }
  ],
  facts: [
    { k: "Inhabited since", v: "Nov 2, 2000 (continuous)" },
    { k: "Size", v: "109 m × ~420 tonnes" },
    { k: "Speed", v: "28,000 km/h, 16 orbits/day" },
    { k: "Partners", v: "5 agencies, 15 nations" },
    { k: "Planned retirement", v: "~2030 (controlled deorbit)" }
  ],
  related: ["mars-exploration", "james-webb", "black-holes"]
}
];

/* ---- helpers exposed globally ---- */
const KB = {
  topics: KB_TOPICS,
  byId: Object.fromEntries(KB_TOPICS.map(t => [t.id, t])),
  trendingList: KB_TOPICS.filter(t => t.trending).sort((a, b) => a.trending - b.trending),
};
