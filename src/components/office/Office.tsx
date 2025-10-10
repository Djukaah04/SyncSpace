import React, { useEffect, useState } from "react";
import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import Modal from "../../utils/modal/Modal";
import type { RootState } from "../../store";
import UserRole from "../../enums/UserRole";
import { useSelector } from "react-redux";

type Seat = {
  id: number;
  x: number;
  y: number;
  reserved?: boolean;
  reservedBy?: string | null;
  reservedUntil?: string | null;
};

const teamSeats = [1, 2, 8]; // your teammates
// const currentUser = { id: "u1", name: "Djordje" };

const Office: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [draggedSeat, setDraggedSeat] = useState<Seat | null>(null);
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "seats"), (snap) => {
      const seatData: Seat[] = snap.docs.map((doc) => {
        return { ...(doc.data() as Seat), id: Number(doc.id) };
      });
      setSeats(seatData);
    });
    return unsubscribe;
  }, []);

  const openModal = (seat: Seat) => {
    if (isAdmin && draggedSeat) return;
    setSelectedSeat(seat);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedSeat(null);
  };

  const handleReserve = async (date: string) => {
    if (!selectedSeat) return;
    const seatRef = doc(db, "seats", String(selectedSeat.id));
    await updateDoc(seatRef, {
      reserved: true,
      reservedBy: user?.id,
      reservedUntil: date,
    });
    closeModal();
  };

  const startDrag = (seat: Seat) => {
    if (!isAdmin) return;
    setDraggedSeat(seat);
  };

  const onDrop = async (e: React.DragEvent, target: Seat) => {
    if (!draggedSeat || draggedSeat.id === target.id) return;

    const draggedRef = doc(db, "seats", String(draggedSeat.id));
    const targetRef = doc(db, "seats", String(target.id));

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

  const recommendSeat = (): Seat | null => {
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
  };

  const recommended = recommendSeat();

  const xVals = Array.from(new Set(seats.map((s) => s.x))).sort(
    (a, b) => a - b
  );
  const yVals = Array.from(new Set(seats.map((s) => s.y))).sort(
    (a, b) => a - b
  );

  const rowCount = Math.max(1, xVals.length || 4);
  const colCount = Math.max(1, yVals.length || 4);

  const xIndexMap = new Map<number, number>();
  xVals.forEach((v, i) => xIndexMap.set(v, i + 1));
  const yIndexMap = new Map<number, number>();
  yVals.forEach((v, i) => yIndexMap.set(v, i + 1));

  const SEAT_SIZE = 60;
  const GAP = 14;

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${colCount}, ${SEAT_SIZE}px)`,
    gridAutoRows: `${SEAT_SIZE}px`,
    gap: `${GAP}px`,
  };

  return (
    <div className="office-container">
      <div className="legend">
        <div className="legend-item">
          <span className="legend-box available" /> Available
        </div>
        <div className="legend-item">
          <span className="legend-box selected" /> Selected
        </div>
        <div className="legend-item">
          <span className="legend-box reserved" /> Unavailable
        </div>
        <div className="legend-item">
          <span className="legend-box teammate" /> Teammate
        </div>
      </div>

      <div className="note">Click to reserve a working station</div>

      <div className="office-layout" style={gridStyle}>
        {seats.map((seat) => {
          const isTeamMate = teamSeats.includes(seat.id);
          const isSelected = selectedSeat?.id === seat.id;

          const gridRow = xIndexMap.get(seat.x) ?? 1;
          const gridCol = yIndexMap.get(seat.y) ?? 1;

          return (
            <div
              key={`seat-${seat.id}`}
              className={`seat ${seat.reserved ? "reserved" : ""} ${
                isTeamMate ? "teammate" : ""
              } ${isSelected ? "selected" : ""}`}
              style={{
                gridColumn: `${gridCol}`,
                gridRow: `${gridRow}`,
              }}
              draggable={isAdmin}
              onDragStart={() => startDrag(seat)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, seat)}
              onClick={() => openModal(seat)}
              role="button"
              aria-pressed={!!isSelected}
              aria-disabled={seat.reserved}
            >
              <span className="seat-label">{seat.id}</span>
              {isTeamMate && (
                <div className="teammate-indicator">
                  <span className="teammate-indicator__star">★</span>
                </div>
              )}
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
