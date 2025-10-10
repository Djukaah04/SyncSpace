import React, { useEffect, useState } from "react";
import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import Modal from "../../utils/modal/Modal";

type Seat = {
  id: number;
  x: number;
  y: number;
  reserved?: boolean;
  reservedBy?: string | null;
  reservedUntil?: string | null;
};

const teamSeats = [1, 2, 8]; // your teammates
const isAdmin = true; // toggle for testing
const currentUser = { id: "u1", name: "Djordje" };

const Office: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [draggedSeat, setDraggedSeat] = useState<Seat | null>(null);

  // Load seats in real time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "seats"), (snap) => {
      const seatData: Seat[] = snap.docs.map((doc) => {
        return { ...(doc.data() as Seat), id: Number(doc.id) };
      });
      setSeats(seatData);
    });
    return unsubscribe;
  }, []);

  // Open modal
  const openModal = (seat: Seat) => {
    if (isAdmin && draggedSeat) return; // ignore if dragging
    setSelectedSeat(seat);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedSeat(null);
  };

  // Reserve a seat
  const handleReserve = async (date: string) => {
    if (!selectedSeat) return;
    const seatRef = doc(db, "seats", String(selectedSeat.id));
    await updateDoc(seatRef, {
      reserved: true,
      reservedBy: currentUser.name,
      reservedUntil: date,
    });
    closeModal();
  };

  // Drag & drop for admin
  const startDrag = (seat: Seat) => {
    if (!isAdmin) return;
    setDraggedSeat(seat);
  };

  const onDrop = async (e: React.DragEvent, target: Seat) => {
    if (!draggedSeat || draggedSeat.id === target.id) return;

    const draggedRef = doc(db, "seats", String(draggedSeat.id));
    const targetRef = doc(db, "seats", String(target.id));

    // swap ONLY reservation info, not coordinates
    const draggedData = {
      reserved: draggedSeat.reserved || false,
      reservedBy: draggedSeat.reservedBy || null,
      reservedUntil: draggedSeat.reservedUntil || null,
    };
    const targetData = {
      reserved: target.reserved || false,
      reservedBy: target.reservedBy || null,
      reservedUntil: target.reservedUntil || null,
    };

    await updateDoc(draggedRef, targetData);
    await updateDoc(targetRef, draggedData);

    setDraggedSeat(null);
  };

  // --- Recommendation logic ---
  function recommendSeat(): Seat | null {
    let bestSeat: Seat | null = null;
    let bestDist = Infinity;

    seats.forEach((seat) => {
      if (seat.reserved) return;
      let totalDist = 0;

      teamSeats.forEach((teamSeatId) => {
        const teammate = seats.find((s) => s.id === teamSeatId);
        if (teammate) {
          const dx = seat.x - teammate.x;
          const dy = seat.y - teammate.y;
          totalDist += Math.sqrt(dx * dx + dy * dy);
        }
      });

      const avgDist = totalDist / teamSeats.length;
      if (avgDist < bestDist) {
        bestDist = avgDist;
        bestSeat = seat;
      }
    });

    return bestSeat;
  }

  const recommended = recommendSeat();

  return (
    <div className="office-container">
      <h2>Office Layout</h2>
      <div className="office-layout">
        {seats.map((seat) => {
          const isTeamMate = teamSeats.includes(seat.id);
          return (
            <div
              key={`seat-${seat.id}`}
              className={`seat ${seat.reserved ? "reserved" : ""} ${
                isTeamMate ? "teammate" : ""
              }`}
              style={{
                left: `${seat.y * 100}px`,
                top: `${seat.x * 100}px`,
              }}
              draggable={isAdmin}
              onDragStart={() => startDrag(seat)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, seat)}
              onClick={() => openModal(seat)}
            >
              <span>{seat.id}</span>
              {isTeamMate && <div className="teammate-indicator">★</div>}
            </div>
          );
        })}
      </div>

      <Modal isOpen={modalIsOpen} onClose={closeModal}>
        {selectedSeat && (
          <div className="reservation-form">
            {selectedSeat.reserved ? (
              <>
                <h3>Seat {selectedSeat.id} is taken</h3>
                <p>Booked by: {selectedSeat.reservedBy}</p>
                <p>Until: {selectedSeat.reservedUntil}</p>
              </>
            ) : (
              <>
                <h3>Reserve Seat {selectedSeat.id}</h3>
                {recommended && selectedSeat.id === recommended.id && (
                  <p>
                    💡 This seat is closest to your team. Recommended for you!
                  </p>
                )}
                <label>
                  Pick date (max 7 days):
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    max={
                      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) => handleReserve(e.target.value)}
                  />
                </label>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Office;
