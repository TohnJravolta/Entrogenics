---
title: "✦ Pebbling Gradient Flux — Abstract"
subtitle: "Memory Swap Ops with Reversibility"
author: "Tohn Burray Travolta (Entrogenic Research Collective)"
collaboration: "Co-synthesized with large-language systems (GPT-5, Claude, Gemini) under the Cyclic-6 and Kybernōsis protocols"
series: "Entrogenic Papers | Adaptive Systems Kollektive"
version: "v1.0 — October 2025"
license: "CC BY-SA 4.0"
repository: "github.com/entrogenics/entrogenics-core"
doi: ""
manifest-type: "entrogenic-standard-paper"
---

# **Abstract**

Memory–time tradeoffs are central in many computing domains, where engineers must choose between storing data (“memory”) or recomputing it (“time overhead”). We present a practical framework grounded in reversible scheduling theory to guide these choices. After reviewing key theory – Bennett’s reversible computation schedules and pebbling games [1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine) [2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all), catalytic memory reuse [3](https://gwern.net/doc/cs/computable/2014-buhrman.pdf#:~:text=We%20define%20the%20notion%20of,for%20exam%02ple%20the%20determinant%20of), and modern time–space

[4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved)

tradeoff bounds – we propose a unified cost model. This “knobs” framework (e.g. cost = α·peak + β·flux + γ·recompute) captures preferences over peak memory, cumulative memory usage (“flux”), and recomputation. We then describe **Pebble-Bridge**, an interactive tool that simulates tree-structured schedules under memory caps. The tool lets users adjust memory caps, cap policies, and cost weights, and compare baseline vs. checkpointing vs. reversible strategies. By visualizing metrics (peak usage, total moves, recomputation count), Pebble-Bridge helps engineers see which scheduling wins under given

[5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory) [6](https://arxiv.org/html/2504.14069v1#:~:text=match%20at%20L436%20high%20main,main%20memory%20leading%20longer%20latencies)

constraints. We illustrate with case studies (e.g. ML activation checkpointing, Merkle-tree ZK proofs, embedded data pipelines) and outline how to map real workloads onto the model. Finally, we discuss benchmarking methodology (metrics like peak memory, move count, recompute steps) and how engineers can export schedules. Throughout we emphasize theoretical connections (e.g. reversible pebbling games

[2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all) ) and cite seminal work, but maintain a practical focus.

[1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine) [2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all) [3](https://gwern.net/doc/cs/computable/2014-buhrman.pdf#:~:text=We%20define%20the%20notion%20of,for%20exam%02ple%20the%20determinant%20of)

[4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved)

[5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory) [6](https://arxiv.org/html/2504.14069v1#:~:text=match%20at%20L436%20high%20main,main%20memory%20leading%20longer%20latencies)

[2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all)

# **Introduction**

Modern systems often run into **memory bottlenecks** . For example, training deep neural networks requires storing all layer activations, leading to GPU memory limits (a ResNet could use ~48 GB) [5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory) . Gradient checkpointing (recomputing some activations on the backward pass) has emerged as a remedy, trading extra computation to save memory [5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory) . Similarly, zero-knowledge (ZK) proofs and Merkle-tree computations handle huge trees of hashes. In blockchain-like proofs, generating Merkle proofs for millions of leaves can exhaust RAM, causing large slowdowns (e.g. OS paging for large trees [6](https://arxiv.org/html/2504.14069v1#:~:text=match%20at%20L436%20high%20main,main%20memory%20leading%20longer%20latencies) ). Even small embedded or streaming pipelines (e.g. sensor data processing) face tight memory: storing all intermediate data may be impossible, forcing recomputation of earlier stages.

[5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory)

[5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory)

[6](https://arxiv.org/html/2504.14069v1#:~:text=match%20at%20L436%20high%20main,main%20memory%20leading%20longer%20latencies)

These **real-world challenges** boil down to choosing schedules under memory constraints: one can either _cache_ intermediate results or _recompute_ them when needed. More memory allows one-shot computation (faster runtime, fewer operations) but uses scarce RAM; less memory forces recomputation (more operations, slower runtime). This tradeoff appears in ML (activation checkpointing vs. caching), cryptographic proofs (precompute Merkle nodes vs. on-the-fly hash), compilers (register allocation vs. recompute values), and embedded tasks. Our goal is a **practical guide** that synthesizes theory into action: (1) recall foundational models (reversible computation and pebbling) from theory; (2) define a cost framework with tunable weights; (3) demonstrate the approach via an interactive scheduler **Pebble-Bridge** ; (4) apply it to example use-cases and benchmarks.

We target systems engineers and researchers (ML infrastructure, ZK proofs, compilers, embedded/DB runtimes). In what follows, Section 2 reviews theory: Bennett’s reversible strategies [1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine) [2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all), tree-pebbling space-time bounds [2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all) [7](https://arxiv.org/abs/1604.05510#:~:text=,hard), catalytic memory [3](https://gwern.net/doc/cs/computable/2014-buhrman.pdf#:~:text=We%20define%20the%20notion%20of,for%20exam%02ple%20the%20determinant%20of), and general time–space tradeoffs [4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved) . Section 3 presents

[1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine) [2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all)

[2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all) [7](https://arxiv.org/abs/1604.05510#:~:text=,hard) [3](https://gwern.net/doc/cs/computable/2014-buhrman.pdf#:~:text=We%20define%20the%20notion%20of,for%20exam%02ple%20the%20determinant%20of) [4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved)

our cost model (peak, flux, recompute) and scheduling knobs. Section 4 describes **Pebble-Bridge** and how it embodies the model. Section 5 discusses benchmarking (metrics, test setups, exporting decisions). Section 6 gives concrete use cases (activation checkpointing, Merkle/ZK proofs, embedded pipelines) and mapping to our model. Section 7 notes limitations. We conclude in Section 8. Entrogenics’ broader research on memory-efficient computing provides context (we reference its insights lightly), but our focus is on the

universal framework and its theoretical roots.

# **Theoretical Background**

## **Reversible Computation (Bennett Schedules)**

A key foundation is that any computation can be made “reversible” by saving intermediate states, at the cost of extra steps [1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine) [2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all) . In 1973 and later work, Bennett showed that an irreversible program using _T_ steps

and _S_ space can be simulated reversibly with time _T_ ^(log 3) (≈ _T_ ^1.585) and space _S·log T_ [1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine) . Intuitively, Bennett’s algorithm places checkpoints at well-chosen intervals, then recursively uncomputes past segments when free memory runs low. Formally, a _reversible pebble game_ abstraction captures this: imagine a DAG of computations where a “pebble” on a node means its result is stored. Bennett’s rule allows placing a pebble on a child node only if its parent is pebbled, and removing (uncomputing) a pebble only if its children are pebbled. Bennett’s original scheme corresponds to a linear graph (a chain of configurations) and yields the O( _T_ ^log3, _S_ - log _T_ ) simulation [1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine) . More generally, reversible simulation is a spectrum: Buhrman–Tromp–Vitányi (2001) proved a tradeoff continuum between “extreme” strategies [4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved) . For

instance, one extreme uses essentially exponential time and tiny extra space (Lange–McKenzie–Tapp’s method), while the other (Bennett’s) uses polynomial space but subexponential time [4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved) . These results ensure that a wide range of (time, space) points are attainable for reversible schedules. We will synthesize these into a simple cost model.

## **Tree Pebbling and Space-Time Trade-offs**

[1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine)

[1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine)

[4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved)

instance, one extreme uses essentially exponential time and tiny extra space (Lange–McKenzie–Tapp’s method), while the other (Bennett’s) uses polynomial space but subexponential time [4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved) . These results ensure that a wide range of (time, space) points are attainable for reversible schedules. We will synthesize these into a simple cost model.

Reversible scheduling can be viewed as a _pebbling game_ on a computation graph. In particular, many workloads are tree-structured (e.g. binary reduction or hashing trees). The _reversible pebble game_ was introduced by Bennett [2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all) : it formalizes computing tree nodes with a limited number of “pebbles” (memory slots) by placing and removing pebbles under dependency rules. The goal is to pebble (compute) all output nodes while never exceeding the pebble (memory) budget. Computing a child requires its parent to be pebbled, and “uncomputing” (removing a pebble) requires children to be pebbled (to preserve reversibility)

[2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all) . Bennett originally analyzed the linear chain; later works tackled trees and general DAGs.

[2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all)

[2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all)

General reversible pebbling is PSPACE-complete to solve optimally [8](https://arxiv.org/pdf/1904.02121#:~:text=The%20problem%20complexity%20has%20been,17), so we rely on heuristics. However, for special cases there are strong bounds. For trees, Komarath _et al._ showed that the minimum pebble count equals one plus the tree’s edge-rank coloring number [7](https://arxiv.org/abs/1604.05510#:~:text=,hard), and that optimal tree-pebbling strategies can be found in polynomial time (unlike general DAGs). They further demonstrated nontrivial time–space bounds: e.g., complete binary trees admit pebblings in _n_ _[O]_ [(log log] _[ n]_ [)] steps (far better than the naive _n_ _[O]_ [(log] _[ n]_ [)] )

[9](https://arxiv.org/abs/1604.05510#:~:text=game%20,this%20end%2C%20we%20show%20that) . Moreover, one can trade space vs. time: any bounded-degree tree on _n_ nodes can be pebbled with _O_ ( _n_ ) _ϵ_ pebbles in _O_ (n) steps, for any constant ε>0 [10](https://arxiv.org/abs/1604.05510#:~:text=match%20at%20L85%20%24%5Cepsilon%20,2001%29%20for%20chains) . In practice, these results hint that even under tight

memory (few pebbles) one can still compute entire trees in linear time by recomputing most of the nodes, whereas allowing slightly more memory drastically reduces recomputation.

[8](https://arxiv.org/pdf/1904.02121#:~:text=The%20problem%20complexity%20has%20been,17)

[7](https://arxiv.org/abs/1604.05510#:~:text=,hard)

_n_ _[O]_ [(log log] _[ n]_ [)] _n_ _[O]_ [(log] _[ n]_ [)]

. Moreover, one can trade space vs. time: any bounded-degree tree on _n_ nodes can be pebbled with

) _ϵ_ pebbles in _O_ (n) steps, for any constant ε>0 [10](https://arxiv.org/abs/1604.05510#:~:text=match%20at%20L85%20%24%5Cepsilon%20,2001%29%20for%20chains) . In practice, these results hint that even under tight

In short, the theory of reversible pebbling provides the **connective tissue** : it shows how storing (pebbling) more nodes speeds computation, while storing fewer necessitates repeated recomputations, formalizing the memory–time tradeoff [2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all) [11](https://arxiv.org/abs/1604.05510#:~:text=game%20,this%20end%2C%20we%20show%20that) .

## **Catalytic Memory Reuse**

A recent concept from complexity theory, _catalytic space_, extends reversible ideas to large “scratch” memory. Buhrman _et al._ (STOC 2014) defined a computation model with a small clean memory and a large auxiliary memory whose initial contents are arbitrary and must be restored (like a “catalyst” in chemistry) [3](https://gwern.net/doc/cs/computable/2014-buhrman.pdf#:~:text=We%20define%20the%20notion%20of,for%20exam%02ple%20the%20determinant%20of) . Crucially, even if the auxiliary memory is incompressible (no free space), it can be temporarily reused and then returned to its initial state. This means that one effectively can exploit large memory _without_ losing its original data. Buhrman _et al._ showed this “catalytic” resource is surprisingly powerful (computing TC¹ circuits with just log-space and arbitrary data tape [3](https://gwern.net/doc/cs/computable/2014-buhrman.pdf#:~:text=We%20define%20the%20notion%20of,for%20exam%02ple%20the%20determinant%20of) ) and proved bounds on what problems remain hard.

[3](https://gwern.net/doc/cs/computable/2014-buhrman.pdf#:~:text=We%20define%20the%20notion%20of,for%20exam%02ple%20the%20determinant%20of)

[3](https://gwern.net/doc/cs/computable/2014-buhrman.pdf#:~:text=We%20define%20the%20notion%20of,for%20exam%02ple%20the%20determinant%20of)

For our purposes, catalytic memory motivates thinking of large scratch space that can be reclaimed. In practical scheduling, this could correspond to using disk or a scratch region: you temporarily overwrite it (with the promise to restore its content) to compute deeper, then roll back. Though returning data requires extra work, the net effect is similar to reversible uncomputation. We incorporate this idea by allowing strategies that “borrow” memory up to a cap, with the obligation to clean up afterward.

## **Schedule Complexity and Time–Space Bounds**

Beyond these models, Buhrman _et al._ also gave general formulae for time–space trade-offs in reversible simulation [4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved) . Their abstract shows the broad picture: previously only trivial extremes were known (exponential time or quadratic space), but they achieved _simultaneously_ subexponential time and subquadratic space [4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved) . In practice, this means one can dial a smooth tradeoff: e.g., allow _T_ ^0.8 overhead with _S_ - (log _T_ )^0.8 space, etc. We don’t use these formulas directly, but they justify that our simple linear cost model can capture meaningful regimes between “all memory” and “all recompute”.

[4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved)

[4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved)

In summary, theoretical results teach us that (a) fully storing all intermediates uses minimal time but may exceed memory; (b) fully reversible computation (maximal uncomputation) uses minimal memory but high

time; and (c) many intermediate points exist where partial uncomputation (checkpointing) yields intermediate cost profiles. Our heuristic model and tool will make these tradeoffs concrete and tunable for practitioners.

# **Method: Heuristic Cost Framework**

To guide strategy choice, we propose a **heuristic cost model** combining memory and time metrics. Let a schedule (plan of compute/uncompute steps) have:

**Peak memory (peak)** : maximum simultaneous storage used (number of pebbles or data elements

held). **Memory flux (flux)** : cumulative memory usage over time (formally, the time-integral of memory footprint). This penalizes holding memory for long periods.

    - **Recompute steps (recompute)** : total number of _extra_ computation steps (pebble placements) above

the minimum needed to compute each node once.

We then define a cost function, for example:

```
 Cost = α·peak + β·flux + γ·recompute.

```

The weights α, β, γ are tunable to reflect priorities. For instance, if memory is extremely scarce, set α≫γ

(favor low peak even if time spikes). If time is critical, set γ≫α (favor fewer recomputations even if more memory). The “flux” term β·flux encourages schedules that not only have low peak but also minimize sustained memory usage (since holding a moderate amount for a long time can hurt throughput in a pipelined system).

In practice, designers can adjust (α,β,γ) according to their hardware constraints and cost of computation. For example:

- If one GPU has 12 GB RAM (peak limit) and compute is cheap, set α high.

- If memory bandwidth or energy cost matters, include β to favor freeing memory quickly.

- If recomputation adds energy or delays, γ penalizes that.

This linear form is not derived from first principles, but it captures the tradeoffs in a **tunably linear way** . It generalizes many known heuristics: e.g. setting β=0, γ=1 (optimize compute) vs. α=1, β=0 (minimize peak memory) vs. a mix. Using this model, we can compare arbitrary scheduling strategies on equal footing.

Given a specific computation (represented as a tree or DAG of tasks), we enumerate candidate schedules (or use known classes of schedules) and compute their metrics. For example:

- **Baseline strategy** : Compute forward in dependency order, caching all results (maximal parallelism,
minimal recompute). This has low recompute but possibly high peak.

- **Partial checkpointing** : Decide some nodes to uncompute after use (e.g. free memory periodically). This
reduces peak but adds some recompute.

- **Fully reversible (Bennett-style)** : Aggressively checkpoint at many points and uncompute whenever
possible. This achieves minimal peak but maximal recompute/time.

Our framework quantifies each and lets engineers pick α,β,γ to find the best cost. The engineer can thus answer: _“Under our memory cap and weights, is it worth doing partial or full recompute? How low must we set_ _peak memory before baseline fails?”_

# **Implementation: The Pebble-Bridge Tool**

We have embodied this model in **Pebble-Bridge**, an interactive scheduling simulator. Pebble-Bridge takes as input a tree-structured computation (users can specify tree shape, node workloads, etc.) and simulates different pebbling strategies under a user-defined memory cap. It supports:

    - **Strategy choices** : e.g. Baseline (no uncompute), Partial (e.g. checkpoint at fixed intervals or depths),

and Reversible (Bennett-style recursive checkpointing). Each strategy yields a different schedule of pebbles.

**Memory cap and cap policy** : A hard limit on pebbles (memory). If a strategy would exceed the cap, a _policy_ determines which nodes to uncompute first (e.g. oldest, random, or priority-based). This models e.g. flushing memory or swapping. **Cost weights (α,β,γ)** : Users enter weights, and Pebble-Bridge computes Cost for each strategy’s schedule (peak, flux, recompute metrics are output).

The core of the tool is a visual DAG viewer where computed nodes light up (pebbles placed) and dims (pebbles removed). As the simulation runs (or steps by step), it displays current memory usage (bar chart) and total steps. Users can pause, adjust weights, or switch strategy on the fly. Importantly, the tool highlights key comparisons: e.g. under a tight memory cap of 50, the baseline strategy may abort (stack overflow), whereas the partial strategy completes with cost X and the reversible with cost Y.

Pebble-Bridge exports detailed schedules and metrics so engineers can analyze them further or deploy decisions (e.g. “checkpoint after these layers”). Internally it uses the theoretical pebble rules [2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all) [1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine) to enforce valid reversibility: it never uncomputes a node unless all children are unpebbled, etc. By tweaking α, β, γ, users see how their preference (e.g. “minimize peak” vs. “minimize recompute”) changes which strategy

wins.

Overall, Pebble-Bridge is a decision-support tool: it **bridges** theory and practice by letting engineers **see** the space-time tradeoffs. For instance, under memory pressure one might find “The partial-checkpoint strategy with 30% recompute had 2× lower peak than baseline, at a 20% time cost; fully reversible gives minimal peak but 5× time cost.” This informs whether that 5× cost is worth the memory saved in context.

# **Evaluation and Benchmarking Guidance**

To use this framework on real problems, we suggest the following evaluation methodology:

    - **Metrics** : Always record _peak memory_, _total steps (moves)_, _recompute steps_, and _flux_ . These directly feed

into the cost. Optionally measure _wall-clock time_ on hardware if implementing the schedule. Also record _schedule length_ (depth) and _operation count_ .

    - **Test setups** : Begin with synthetic trees (e.g. balanced binary trees, skewed trees) to calibrate tool

behavior. Then apply to real DAGs (e.g. an actual NN graph, a snippet of a ZK circuit) by mapping them to a tree-like model (possible via topological sorts or spanning trees). For each test, vary memory caps to see where strategies flip in cost.

**Profiling** : If using an AD or ML library, instrumentation can measure the extra time from recomputation vs. saved memory. For example, Tapenade’s AD profiler computes per-checkpoint _run-time benefit_ and _memory cost_ [12](https://arxiv.org/html/2405.15590v2#:~:text=) . We recommend similarly collecting both: how much time is saved vs. how much memory is used by each strategy.

[12](https://arxiv.org/html/2405.15590v2#:~:text=)

- **Exporting decisions** : Pebble-Bridge can output the chosen schedule (e.g. a list of “uncompute node

X after node Y”). Engineers should translate this into code: checkpoint these points, free and recompute as needed. For reproducibility, log the weights (α,β,γ) and policy settings that led to the

choice.

    - **Benchmark example** : A typical workflow: (1) Graph your computation as a tree of _N_ nodes. (2) Pick a

strategy (baseline, partial, reversible) and simulate it with your memory cap. (3) Compute metrics; plot memory vs. time (or flux). (4) Adjust α,β,γ and rerun to find Pareto-optimal points. (5) If using actual hardware, implement the schedule via checkpoint libraries and measure actual runtime and memory. Compare empirical costs to the model’s predictions.

This process yields both _quantitative_ (peak, time) and _qualitative_ (feasibility under cap) insights. If baseline exceeds memory, that’s a clear signal to try checkpointing. The model thus not only scores strategies but also tests feasibility: “Can we run at all under 8 GB, and if so, which plan uses the least CPU?”

# **Use Cases**

## **Activation Checkpointing in ML**

As noted, training deep nets (transformers, ResNets, RNNs) easily exhausts GPU RAM. Gradient checkpointing (a.k.a. activation checkpointing) is widely used: it omits storing some layer activations during the forward pass, then recomputes them during backpropagation [5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory) . Chen _et al._ showed this reduces

memory from _O_ (n) to _O_ (√n) for _n_ -layer nets [5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory) (cutting, e.g., a 48 GB requirement to 7 GB). In our model, a neural network can be viewed as a linear or layered graph; baseline stores all activations (high peak, zero recompute), while checkpointing stores only a subset (lower peak, extra recompute). Pebble-Bridge can simulate different checkpoint granularities: e.g. store every 10th layer’s activations, recompute the 9 layers

in between. Engineers can set α high if memory is extremely tight, forcing more layers to be recomputed to minimize peak. This will show, for example, that at 8 GB GPU limit, checkpointing reduces peak by 50% at the cost of 25% slower training [5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory), matching empirical ML insights. The tool helps pick which layers to checkpoint and how often, by quantifying the tradeoff.

## **Merkle-Tree Proofs in ZK Systems**

Consider computing or proving a Merkle root of a large tree (e.g. for a ZK-SNARK). The tree (height H) has ~2^H leaves; computing the root is tree-pebbling from leaves up. A naive strategy stores all intermediate

hashes (peak ~ 2^H) and computes in _O_ (2^H) time once. A memory-limited strategy might recompute subtrees instead of storing them. Prior work on Merkle traversal shows classic trade-offs: e.g. Jakobsson’s

“fractal Merkle” method precomputes √N nodes to achieve linear time [13](https://arxiv.org/abs/1409.4081#:~:text=,Our) . Knecht _et al._ combined fractal and log-space strategies to further reduce space [13](https://arxiv.org/abs/1409.4081#:~:text=,Our) .

[13](https://arxiv.org/abs/1409.4081#:~:text=,Our)

[13](https://arxiv.org/abs/1409.4081#:~:text=,Our)

In practice, a proof system may hit memory limits: e.g. a recent Ethereum study found that largest Merkletree proofs had spikes in proving time due to paging [6](https://arxiv.org/html/2504.14069v1#:~:text=match%20at%20L436%20high%20main,main%20memory%20leading%20longer%20latencies) . Using Pebble-Bridge, one can model a Merkle tree: the engineer sets memory cap (e.g. available RAM), and compares strategies: the “full cache” vs. “checkpoint subtrees”. The tool will show that a partial strategy uses, say, 4× less peak memory at the cost

of 1.5× more hashes (matching known √N behavior). By adjusting α/γ, one can decide if the extra hash computations are worth the memory saved for the given hardware and proof time budget. Also, mapping specific ZK circuits with tree-like substructures (e.g. recursive hash checks) into this model helps understand if _reversibility_ (uncomputing partial results) is beneficial.

## **Embedded Data Pipelines and Streaming**

In embedded or real-time pipelines (signal processing, robotics), memory is scarce. For example, a multi stage image filter pipeline (blur → transform → detect) might be modelled as a chain or tree of operations. Storing all intermediate image buffers may be impossible. Instead, one might process chunk-by-chunk, recomputing earlier filters for each chunk (trading compute cycles for SRAM). Using our framework, engineers can represent each stage as a node, and simulate whether to “flush” outputs immediately (recompute later) or buffer them. The cost model’s β·flux term is relevant here: holding a buffer (peak memory) for a long time may hurt system throughput (cache pressure), so a policy of early free (increasing flux) might be favored. Though we have no direct citation, such trade-offs are standard in embedded design: designers will relate our model to, e.g., image tiling techniques.

## **Mapping Workloads to the Model**

To apply this, one abstracts the workload as a directed computation graph. Straight-line code or feedforward ML nets map to linear chains. Tree-like reductions (hash trees, combining results) map to trees. General DAGs can often be transformed to trees by (for instance) duplicating shared subexpressions or choosing a tree decomposition. Each node is assigned a “compute cost” (for recompute counting) and a “memory cost” (for pebble weight; often 1 if each intermediate is same size). Then run Pebble-Bridge on

that model.

The user guide of Pebble-Bridge (omitted here) gives detailed mapping instructions. In brief: partition your computation into checkpoints (subgraphs). Each checkpoint is a node. Connect them by data dependencies. Provide execution order (topological). The tool then simulates scheduling under the hood.

# **Limitations and Discussion**

Our framework simplifies reality: it assumes a DAG (often a tree) of tasks with independent operations. Real workloads may have loops, side effects, or irregular dependencies. We do not model I/O or communication costs, only raw computation steps and memory usage. The cost model is linear and heuristic; it may not capture, for example, caching effects or nonlinear energy costs. The “flux” metric is also a simplification (actual impact of sustained memory depends on many factors).

Pebble-Bridge handles static trees; dynamic or data-dependent control flow is out of scope. The tool does not schedule multiple processors or distributed memory. It also assumes recomputation cost is uniform per node (which may not hold if some nodes are much heavier to compute). In practice, an engineer must calibrate: e.g. assign higher γ for expensive recomputations.

Finally, theoretical results like Buhrman’s time–space bounds [4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved) or Komarath’s pebbling limits [7](https://arxiv.org/abs/1604.05510#:~:text=,hard) [11](https://arxiv.org/abs/1604.05510#:~:text=game%20,this%20end%2C%20we%20show%20that) serve as guides, but optimal schedules are PSPACE-hard in general [8](https://arxiv.org/pdf/1904.02121#:~:text=The%20problem%20complexity%20has%20been,17) . Thus Pebble-Bridge uses heuristics for partial strategies. It should be seen as decision support, not as giving provably optimal schedules.

[4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved) [7](https://arxiv.org/abs/1604.05510#:~:text=,hard) [11](https://arxiv.org/abs/1604.05510#:~:text=game%20,this%20end%2C%20we%20show%20that)

# **Conclusion**

Managing memory–time tradeoffs is a classic yet ever-relevant problem across ML, cryptography, compilers, and embedded systems. We have presented a **practical hybrid framework** that builds on reversible scheduling theory to help engineers navigate these tradeoffs. By reviewing the theory (Bennett’s reversible strategies [1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine) [2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all), pebbling on trees [7](https://arxiv.org/abs/1604.05510#:~:text=,hard) [11](https://arxiv.org/abs/1604.05510#:~:text=game%20,this%20end%2C%20we%20show%20that), and catalytic memory [3](https://gwern.net/doc/cs/computable/2014-buhrman.pdf#:~:text=We%20define%20the%20notion%20of,for%20exam%02ple%20the%20determinant%20of) ) and condensing it into a simple cost model (α·peak + β·flux + γ·recompute), we give practitioners actionable knobs. The PebbleBridge tool makes these concepts concrete: engineers can simulate and compare scheduling strategies under real memory caps and cost preferences. Use cases in ML checkpointing [5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory) and ZK proofs [6](https://arxiv.org/html/2504.14069v1#:~:text=match%20at%20L436%20high%20main,main%20memory%20leading%20longer%20latencies) illustrate how the model maps to real workflows.

[1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine) [2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all) [7](https://arxiv.org/abs/1604.05510#:~:text=,hard) [11](https://arxiv.org/abs/1604.05510#:~:text=game%20,this%20end%2C%20we%20show%20that) [3](https://gwern.net/doc/cs/computable/2014-buhrman.pdf#:~:text=We%20define%20the%20notion%20of,for%20exam%02ple%20the%20determinant%20of)

[5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory) [6](https://arxiv.org/html/2504.14069v1#:~:text=match%20at%20L436%20high%20main,main%20memory%20leading%20longer%20latencies)

In summary, this whitepaper bridges theory and practice: it provides a structured approach to scheduling under memory constraints, grounded in reversible computation research, but always pitched toward engineering decisions. As hardware and workloads evolve (e.g. ever-deeper neural nets, larger proof circuits), we expect this framework to remain useful. The ideas align with emerging work (including by Entrogenics) on memory-aware computation and catalytic reuse, and we invite further refinement of the model and tool with the community.

[1](https://arxiv.org/pdf/quant-ph/0101133#:~:text=The%20reversible%20Bennett%20strategy%20,the%20irreversible%20deterministic%20Turing%20machine) [4](https://arxiv.org/pdf/quant-ph/0101133#:~:text=Abstract,in%20that%20it%20is%20achieved)

arXiv:quant-ph/0101133v2 19 Apr 2001

[https://arxiv.org/pdf/quant-ph/0101133](https://arxiv.org/pdf/quant-ph/0101133)

[2](https://arxiv.org/pdf/1904.02121#:~:text=reversible%20pebbling%20game%20problem%20has,on%20a%20node%20if%20all) [8](https://arxiv.org/pdf/1904.02121#:~:text=The%20problem%20complexity%20has%20been,17)

arxiv.org

[https://arxiv.org/pdf/1904.02121](https://arxiv.org/pdf/1904.02121)

[3](https://gwern.net/doc/cs/computable/2014-buhrman.pdf#:~:text=We%20define%20the%20notion%20of,for%20exam%02ple%20the%20determinant%20of)

Computing with a Full Memory: Catalytic Space

[https://gwern.net/doc/cs/computable/2014-buhrman.pdf](https://gwern.net/doc/cs/computable/2014-buhrman.pdf)

[5](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html#:~:text=Gradient%20checkpointing%20was%20first%20published,in%20memory)

Gradient Checkpoints — PyTorch Training Performance Guide

[https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html](https://residentmario.github.io/pytorch-training-performance-guide/gradient-checkpoints.html)

[6](https://arxiv.org/html/2504.14069v1#:~:text=match%20at%20L436%20high%20main,main%20memory%20leading%20longer%20latencies)

Towards Stateless Clients in Ethereum: Benchmarking Verkle Trees and Binary Merkle Trees with SNARKs

[https://arxiv.org/html/2504.14069v1](https://arxiv.org/html/2504.14069v1)

[7](https://arxiv.org/abs/1604.05510#:~:text=,hard) [9](https://arxiv.org/abs/1604.05510#:~:text=game%20,this%20end%2C%20we%20show%20that) [10](https://arxiv.org/abs/1604.05510#:~:text=match%20at%20L85%20%24%5Cepsilon%20,2001%29%20for%20chains) [11](https://arxiv.org/abs/1604.05510#:~:text=game%20,this%20end%2C%20we%20show%20that)

[1604.05510] Pebbling Meets Coloring: Reversible Pebble Game On Trees

[https://arxiv.org/abs/1604.05510](https://arxiv.org/abs/1604.05510)

[12](https://arxiv.org/html/2405.15590v2#:~:text=)

Profiling checkpointing schedules in adjoint ST-AD

[https://arxiv.org/html/2405.15590v2](https://arxiv.org/html/2405.15590v2)

[13](https://arxiv.org/abs/1409.4081#:~:text=,Our)

[1409.4081] A space- and time-efficient Implementation of the Merkle Tree Traversal Algorithm

[https://arxiv.org/abs/1409.4081](https://arxiv.org/abs/1409.4081)